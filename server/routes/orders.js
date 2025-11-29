import express from 'express';
import { query } from '../database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create Order
router.post('/', async (req, res) => {
    const { userId, total, items, branchId, deliverySlotId, paymentMethod, shippingDetails, deliveryAddress } = req.body;
    const status = 'pending';

    // Build shipping_info from shippingDetails or deliveryAddress for backward compatibility
    const shippingInfo = shippingDetails || (deliveryAddress ? { address: deliveryAddress } : null);

    try {
        await query('BEGIN');

        // Reserve inventory for each item
        for (const item of items) {
            const { rows: stockRows } = await query(
                "SELECT stock_quantity, reserved_quantity FROM branch_products WHERE branch_id = $1 AND product_id = $2 FOR UPDATE",
                [branchId, item.id || item.productId]
            );

            if (stockRows.length === 0) {
                await query('ROLLBACK');
                return res.status(400).send({ error: `Product ${item.name} not available at this branch` });
            }

            const stock = stockRows[0];
            const availableStock = stock.stock_quantity - stock.reserved_quantity;

            if (availableStock < item.quantity) {
                await query('ROLLBACK');
                return res.status(400).send({ 
                    error: `Insufficient stock for ${item.name}. Available: ${availableStock}` 
                });
            }

            // Reserve the quantity
            await query(
                "UPDATE branch_products SET reserved_quantity = reserved_quantity + $1 WHERE branch_id = $2 AND product_id = $3",
                [item.quantity, branchId, item.id || item.productId]
            );
        }

        // Reserve delivery slot if provided
        if (deliverySlotId) {
            const { rows: slotRows } = await query(
                "SELECT * FROM delivery_slots WHERE id = $1 FOR UPDATE",
                [deliverySlotId]
            );

            if (slotRows.length === 0) {
                await query('ROLLBACK');
                return res.status(400).send({ error: 'Delivery slot not found' });
            }

            const slot = slotRows[0];
            if (slot.current_orders >= slot.max_orders) {
                await query('ROLLBACK');
                return res.status(400).send({ error: 'Delivery slot is full' });
            }

            await query(
                "UPDATE delivery_slots SET current_orders = current_orders + 1 WHERE id = $1",
                [deliverySlotId]
            );
        }

        // Insert Order
        const insertSql = `
            INSERT INTO orders (user_id, branch_id, total, items, status, delivery_slot_id, payment_method, payment_status, shipping_info) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8) 
            RETURNING id
        `;
        const { rows } = await query(insertSql, [
            userId, 
            branchId || null, 
            total, 
            JSON.stringify(items), 
            status,
            deliverySlotId || null,
            paymentMethod || 'cod',
            shippingInfo ? JSON.stringify(shippingInfo) : null
        ]);
        const orderId = rows[0].id;

        // Clear cart
        await query("DELETE FROM cart WHERE user_id = $1", [userId]);

        // Note: Loyalty points are awarded only when order is delivered

        await query('COMMIT');

        res.status(200).send({ 
            message: "Order created", 
            orderId: orderId 
        });
    } catch (err) {
        await query('ROLLBACK');
        console.error("Order creation error:", err);
        res.status(500).send({ error: "Problem creating order.", details: err.message });
    }
});

// Get Orders (User or Admin)
router.get('/', [verifyToken], async (req, res) => {
    const userId = req.query.userId;
    const userRole = req.userRole;
    const requesterId = req.userId;

    let sql = "SELECT * FROM orders";
    let params = [];

    // If admin/employee, can see all orders or filter by userId
    if (userRole === 'owner' || userRole === 'manager' || userRole === 'employee') {
        if (userId) {
            sql += " WHERE user_id = $1";
            params.push(userId);
        }
    } else {
        // Regular user can only see their own orders
        sql += " WHERE user_id = $1";
        params.push(requesterId);
    }

    sql += " ORDER BY date DESC";

    try {
        const { rows } = await query(sql, params);
        const orders = rows.map(o => ({
            ...o,
            // pg returns JSONB as object automatically, no need to parse if it's correct type.
            // But if it returns string (e.g. text column), we parse. Schema says JSONB.
            // pg driver parses JSONB automatically.
            items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
            userId: o.user_id, // Map back for frontend compatibility if needed
            branchId: o.branch_id
        }));

        res.json({
            "message": "success",
            "data": orders
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Get single order
router.get('/:orderId', [verifyToken], async (req, res) => {
    const { orderId } = req.params;
    const userRole = req.userRole;
    const requesterId = req.userId;

    try {
        const { rows } = await query("SELECT * FROM orders WHERE id = $1", [orderId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = rows[0];

        // Check authorization
        if (userRole !== 'owner' && userRole !== 'manager' && userRole !== 'employee' && order.user_id !== requesterId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json({
            message: 'success',
            data: {
                ...order,
                items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
                userId: order.user_id,
                branchId: order.branch_id,
                deliverySlotId: order.delivery_slot_id,
                paymentMethod: order.payment_method,
                paymentStatus: order.payment_status
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Order Status
router.put('/:id/status', [verifyToken, isAdmin], async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    try {
        await query('BEGIN');

        // Get order details
        const { rows: orderRows } = await query("SELECT * FROM orders WHERE id = $1", [orderId]);
        
        if (orderRows.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderRows[0];
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

        // If confirming order: deduct from stock and reserved
        if (status === 'confirmed' && order.status === 'pending') {
            for (const item of items) {
                await query(
                    `UPDATE branch_products 
                     SET stock_quantity = stock_quantity - $1,
                         reserved_quantity = reserved_quantity - $1
                     WHERE branch_id = $2 AND product_id = $3`,
                    [item.quantity, order.branch_id, item.id || item.productId]
                );
            }
        }

        // If cancelling order: release reserved inventory and slot
        if (status === 'cancelled') {
            for (const item of items) {
                await query(
                    "UPDATE branch_products SET reserved_quantity = GREATEST(reserved_quantity - $1, 0) WHERE branch_id = $2 AND product_id = $3",
                    [item.quantity, order.branch_id, item.id || item.productId]
                );
            }

            // Release delivery slot
            if (order.delivery_slot_id) {
                await query(
                    "UPDATE delivery_slots SET current_orders = GREATEST(current_orders - 1, 0) WHERE id = $1",
                    [order.delivery_slot_id]
                );
            }
        }

        // Award Loyalty Points ONLY when order is delivered
        if (status === 'delivered' && order.status !== 'delivered') {
            const points = Math.floor(Number(order.total) || 0);
            if (points > 0 && order.user_id) {
                await query(
                    "UPDATE users SET loyalty_points = COALESCE(loyalty_points, 0) + $1 WHERE id = $2",
                    [points, order.user_id]
                );
                console.log(`Awarded ${points} loyalty points to user ${order.user_id} for order ${orderId}`);
            }
        }

        // Update order status
        const result = await query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING *", [status, orderId]);

        await query('COMMIT');

        res.json({ message: "success", data: result.rows[0] });
    } catch (err) {
        await query('ROLLBACK');
        console.error("Error updating order status:", err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
