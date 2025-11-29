import express from 'express';
import { query } from '../database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// موظفي التوصيل (Delivery Staff)
// ============================================

// الحصول على جميع موظفي التوصيل
router.get('/delivery-staff', verifyToken, async (req, res) => {
    const { branchId } = req.query;
    
    try {
        let sql = `
            SELECT ds.*, u.email, u.role,
                   ARRAY_AGG(DISTINCT b.id) as branch_ids,
                   ARRAY_AGG(DISTINCT b.name) as branch_names
            FROM delivery_staff ds
            JOIN users u ON ds.user_id = u.id
            LEFT JOIN delivery_staff_branches dsb ON ds.id = dsb.delivery_staff_id
            LEFT JOIN branches b ON dsb.branch_id = b.id
        `;
        
        if (branchId) {
            sql += ` WHERE dsb.branch_id = $1`;
        }
        
        sql += ` GROUP BY ds.id, u.email, u.role ORDER BY ds.name`;
        
        const { rows } = await query(sql, branchId ? [branchId] : []);
        res.json({ message: 'success', data: rows });
    } catch (err) {
        console.error('Error fetching delivery staff:', err);
        res.status(500).json({ error: err.message });
    }
});

// إضافة موظف توصيل جديد
router.post('/delivery-staff', [verifyToken, isAdmin], async (req, res) => {
    const { name, email, password, phone, phone2, branchIds, maxOrders } = req.body;
    
    try {
        await query('BEGIN');
        
        // إنشاء المستخدم أولاً
        const userSql = `
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, 'delivery')
            RETURNING id
        `;
        const { rows: userRows } = await query(userSql, [name, email, password]);
        const userId = userRows[0].id;
        
        // إنشاء سجل موظف التوصيل
        const staffSql = `
            INSERT INTO delivery_staff (user_id, name, phone, phone2, max_orders)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const { rows: staffRows } = await query(staffSql, [userId, name, phone, phone2 || null, maxOrders || 5]);
        const staffId = staffRows[0].id;
        
        // ربط الموظف بالفروع
        if (branchIds && branchIds.length > 0) {
            for (const branchId of branchIds) {
                await query(
                    'INSERT INTO delivery_staff_branches (delivery_staff_id, branch_id) VALUES ($1, $2)',
                    [staffId, branchId]
                );
            }
        }
        
        await query('COMMIT');
        res.json({ message: 'success', data: staffRows[0] });
    } catch (err) {
        await query('ROLLBACK');
        console.error('Error creating delivery staff:', err);
        res.status(400).json({ error: err.message });
    }
});

// تحديث موظف توصيل
router.put('/delivery-staff/:id', [verifyToken, isAdmin], async (req, res) => {
    const { id } = req.params;
    const { name, phone, phone2, branchIds, maxOrders, isAvailable } = req.body;
    
    try {
        await query('BEGIN');
        
        // تحديث بيانات الموظف
        const updateSql = `
            UPDATE delivery_staff 
            SET name = COALESCE($1, name),
                phone = COALESCE($2, phone),
                phone2 = COALESCE($3, phone2),
                max_orders = COALESCE($4, max_orders),
                is_available = COALESCE($5, is_available)
            WHERE id = $6
            RETURNING *
        `;
        const { rows } = await query(updateSql, [name, phone, phone2, maxOrders, isAvailable, id]);
        
        if (rows.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({ error: 'Delivery staff not found' });
        }
        
        // تحديث الفروع إذا تم تمريرها
        if (branchIds !== undefined) {
            await query('DELETE FROM delivery_staff_branches WHERE delivery_staff_id = $1', [id]);
            for (const branchId of branchIds) {
                await query(
                    'INSERT INTO delivery_staff_branches (delivery_staff_id, branch_id) VALUES ($1, $2)',
                    [id, branchId]
                );
            }
        }
        
        await query('COMMIT');
        res.json({ message: 'success', data: rows[0] });
    } catch (err) {
        await query('ROLLBACK');
        console.error('Error updating delivery staff:', err);
        res.status(400).json({ error: err.message });
    }
});

// حذف موظف توصيل
router.delete('/delivery-staff/:id', [verifyToken, isAdmin], async (req, res) => {
    const { id } = req.params;
    
    try {
        // جلب user_id قبل الحذف
        const { rows: staffRows } = await query('SELECT user_id FROM delivery_staff WHERE id = $1', [id]);
        if (staffRows.length === 0) {
            return res.status(404).json({ error: 'Delivery staff not found' });
        }
        
        // حذف المستخدم (سيحذف موظف التوصيل بسبب CASCADE)
        await query('DELETE FROM users WHERE id = $1', [staffRows[0].user_id]);
        res.json({ message: 'deleted' });
    } catch (err) {
        console.error('Error deleting delivery staff:', err);
        res.status(400).json({ error: err.message });
    }
});

// ============================================
// طلبات موزع الطلبات (Order Distributor)
// ============================================

// الحصول على الطلبات للتحضير (لموزع الطلبات)
router.get('/orders-to-prepare', verifyToken, async (req, res) => {
    const { branchId, status } = req.query;
    
    try {
        let sql = `
            SELECT o.*, u.name as customer_name, u.email as customer_email,
                   b.name as branch_name,
                   oa.id as assignment_id, oa.status as preparation_status,
                   ds.name as delivery_name, ds.phone as delivery_phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN branches b ON o.branch_id = b.id
            LEFT JOIN order_assignments oa ON o.id = oa.order_id
            LEFT JOIN delivery_staff ds ON oa.delivery_staff_id = ds.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;
        
        if (branchId) {
            sql += ` AND o.branch_id = $${paramIndex}`;
            params.push(branchId);
            paramIndex++;
        }
        
        if (status) {
            sql += ` AND o.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        } else {
            // بشكل افتراضي، أظهر الطلبات المؤكدة وفي التحضير
            sql += ` AND o.status IN ('confirmed', 'preparing', 'ready')`;
        }
        
        sql += ` ORDER BY o.date DESC`;
        
        const { rows } = await query(sql, params);
        res.json({ message: 'success', data: rows });
    } catch (err) {
        console.error('Error fetching orders to prepare:', err);
        res.status(500).json({ error: err.message });
    }
});

// بدء تحضير طلب
router.post('/start-preparation/:orderId', verifyToken, async (req, res) => {
    const { orderId } = req.params;
    const distributorId = req.user.id;
    
    try {
        await query('BEGIN');
        
        // تحديث حالة الطلب
        await query("UPDATE orders SET status = 'preparing' WHERE id = $1", [orderId]);
        
        // إنشاء سجل التعيين
        const assignSql = `
            INSERT INTO order_assignments (order_id, distributor_id, status)
            VALUES ($1, $2, 'preparing')
            ON CONFLICT (order_id) DO UPDATE SET status = 'preparing', distributor_id = EXCLUDED.distributor_id
            RETURNING *
        `;
        // Note: نحتاج unique constraint على order_id
        
        // جلب عناصر الطلب وإنشاء قائمة التحضير
        const { rows: orderRows } = await query('SELECT items FROM orders WHERE id = $1', [orderId]);
        if (orderRows.length > 0 && orderRows[0].items) {
            const items = typeof orderRows[0].items === 'string' ? JSON.parse(orderRows[0].items) : orderRows[0].items;
            
            // حذف العناصر القديمة إن وجدت
            await query('DELETE FROM order_preparation_items WHERE order_id = $1', [orderId]);
            
            // إضافة عناصر التحضير
            for (const item of items) {
                await query(`
                    INSERT INTO order_preparation_items (order_id, product_id, product_name, quantity)
                    VALUES ($1, $2, $3, $4)
                `, [orderId, item.productId || item.id, item.name || item.title, item.quantity]);
            }
        }
        
        // إنشاء أو تحديث سجل التعيين
        const { rows: existingAssignment } = await query('SELECT id FROM order_assignments WHERE order_id = $1', [orderId]);
        if (existingAssignment.length > 0) {
            await query(`
                UPDATE order_assignments 
                SET status = 'preparing', distributor_id = $1 
                WHERE order_id = $2
            `, [distributorId, orderId]);
        } else {
            await query(`
                INSERT INTO order_assignments (order_id, distributor_id, status)
                VALUES ($1, $2, 'preparing')
            `, [orderId, distributorId]);
        }
        
        await query('COMMIT');
        res.json({ message: 'success', status: 'preparing' });
    } catch (err) {
        await query('ROLLBACK');
        console.error('Error starting preparation:', err);
        res.status(400).json({ error: err.message });
    }
});

// الحصول على عناصر تحضير الطلب (Todo List)
router.get('/preparation-items/:orderId', verifyToken, async (req, res) => {
    const { orderId } = req.params;
    
    try {
        const { rows } = await query(`
            SELECT * FROM order_preparation_items 
            WHERE order_id = $1 
            ORDER BY id
        `, [orderId]);
        
        res.json({ message: 'success', data: rows });
    } catch (err) {
        console.error('Error fetching preparation items:', err);
        res.status(500).json({ error: err.message });
    }
});

// تحديث حالة عنصر تحضير (checkbox)
router.put('/preparation-items/:itemId', verifyToken, async (req, res) => {
    const { itemId } = req.params;
    const { isPrepared, notes } = req.body;
    const preparedBy = req.user.id;
    
    try {
        const { rows } = await query(`
            UPDATE order_preparation_items 
            SET is_prepared = $1, 
                prepared_at = CASE WHEN $1 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END,
                prepared_by = CASE WHEN $1 = TRUE THEN $2 ELSE NULL END,
                notes = COALESCE($3, notes)
            WHERE id = $4
            RETURNING *
        `, [isPrepared, preparedBy, notes, itemId]);
        
        res.json({ message: 'success', data: rows[0] });
    } catch (err) {
        console.error('Error updating preparation item:', err);
        res.status(400).json({ error: err.message });
    }
});

// إتمام تحضير الطلب
router.post('/complete-preparation/:orderId', verifyToken, async (req, res) => {
    const { orderId } = req.params;
    
    try {
        await query('BEGIN');
        
        // التحقق من أن جميع العناصر تم تحضيرها
        const { rows: items } = await query(`
            SELECT COUNT(*) as total, SUM(CASE WHEN is_prepared THEN 1 ELSE 0 END) as prepared
            FROM order_preparation_items WHERE order_id = $1
        `, [orderId]);
        
        if (items[0].total > 0 && items[0].total !== items[0].prepared) {
            await query('ROLLBACK');
            return res.status(400).json({ 
                error: 'لم يتم تحضير جميع العناصر بعد',
                remaining: items[0].total - items[0].prepared 
            });
        }
        
        // تحديث حالة الطلب إلى جاهز
        await query("UPDATE orders SET status = 'ready' WHERE id = $1", [orderId]);
        
        // تحديث سجل التعيين
        await query(`
            UPDATE order_assignments SET status = 'ready' WHERE order_id = $1
        `, [orderId]);
        
        await query('COMMIT');
        res.json({ message: 'success', status: 'ready' });
    } catch (err) {
        await query('ROLLBACK');
        console.error('Error completing preparation:', err);
        res.status(400).json({ error: err.message });
    }
});

// ============================================
// تعيين الديليفري للطلب
// ============================================

// الحصول على موظفي التوصيل المتاحين لفرع معين
router.get('/available-delivery/:branchId', verifyToken, async (req, res) => {
    const { branchId } = req.params;
    
    try {
        const { rows } = await query(`
            SELECT ds.* 
            FROM delivery_staff ds
            JOIN delivery_staff_branches dsb ON ds.id = dsb.delivery_staff_id
            WHERE dsb.branch_id = $1 
              AND ds.is_available = TRUE 
              AND ds.current_orders < ds.max_orders
            ORDER BY ds.current_orders ASC
        `, [branchId]);
        
        res.json({ message: 'success', data: rows });
    } catch (err) {
        console.error('Error fetching available delivery staff:', err);
        res.status(500).json({ error: err.message });
    }
});

// تعيين ديليفري للطلب
router.post('/assign-delivery/:orderId', verifyToken, async (req, res) => {
    const { orderId } = req.params;
    const { deliveryStaffId } = req.body;
    
    try {
        await query('BEGIN');
        
        // تحديث سجل التعيين
        await query(`
            UPDATE order_assignments 
            SET delivery_staff_id = $1, status = 'assigned', assigned_at = CURRENT_TIMESTAMP
            WHERE order_id = $2
        `, [deliveryStaffId, orderId]);
        
        // تحديث حالة الطلب
        await query("UPDATE orders SET status = 'out_for_delivery' WHERE id = $1", [orderId]);
        
        // زيادة عدد الطلبات للديليفري
        await query(`
            UPDATE delivery_staff SET current_orders = current_orders + 1 WHERE id = $1
        `, [deliveryStaffId]);
        
        await query('COMMIT');
        res.json({ message: 'success', status: 'assigned' });
    } catch (err) {
        await query('ROLLBACK');
        console.error('Error assigning delivery:', err);
        res.status(400).json({ error: err.message });
    }
});

// الديليفري يستلم الطلب
router.post('/pickup-order/:orderId', verifyToken, async (req, res) => {
    const { orderId } = req.params;
    
    try {
        await query(`
            UPDATE order_assignments 
            SET status = 'picked_up', picked_up_at = CURRENT_TIMESTAMP
            WHERE order_id = $1
        `, [orderId]);
        
        res.json({ message: 'success', status: 'picked_up' });
    } catch (err) {
        console.error('Error picking up order:', err);
        res.status(400).json({ error: err.message });
    }
});

// الديليفري يوصل الطلب
router.post('/deliver-order/:orderId', verifyToken, async (req, res) => {
    const { orderId } = req.params;
    
    try {
        await query('BEGIN');
        
        // جلب بيانات الطلب
        const { rows: orderRows } = await query(
            'SELECT user_id, total FROM orders WHERE id = $1',
            [orderId]
        );
        
        // جلب معرف الديليفري
        const { rows: assignmentRows } = await query(
            'SELECT delivery_staff_id FROM order_assignments WHERE order_id = $1',
            [orderId]
        );
        
        // تحديث سجل التعيين
        await query(`
            UPDATE order_assignments 
            SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP
            WHERE order_id = $1
        `, [orderId]);
        
        // تحديث حالة الطلب
        await query("UPDATE orders SET status = 'delivered' WHERE id = $1", [orderId]);
        
        // تقليل عدد الطلبات للديليفري
        if (assignmentRows.length > 0 && assignmentRows[0].delivery_staff_id) {
            await query(`
                UPDATE delivery_staff SET current_orders = GREATEST(0, current_orders - 1) 
                WHERE id = $1
            `, [assignmentRows[0].delivery_staff_id]);
        }
        
        // إضافة نقاط الولاء للعميل عند التوصيل
        let pointsAwarded = 0;
        if (orderRows.length > 0 && orderRows[0].user_id) {
            const points = Math.floor(Number(orderRows[0].total) || 0);
            if (points > 0) {
                await query(
                    "UPDATE users SET loyalty_points = COALESCE(loyalty_points, 0) + $1 WHERE id = $2",
                    [points, orderRows[0].user_id]
                );
                pointsAwarded = points;
                console.log(`Awarded ${points} loyalty points to user ${orderRows[0].user_id} for order ${orderId}`);
            }
        }
        
        await query('COMMIT');
        res.json({ message: 'success', status: 'delivered', pointsAwarded });
    } catch (err) {
        await query('ROLLBACK');
        console.error('Error delivering order:', err);
        res.status(400).json({ error: err.message });
    }
});

// ============================================
// صفحة الديليفري
// ============================================

// جلب طلبات الديليفري الحالي
router.get('/my-delivery-orders', verifyToken, async (req, res) => {
    try {
        // جلب معرف موظف التوصيل من المستخدم الحالي
        const { rows: staffRows } = await query(
            'SELECT id FROM delivery_staff WHERE user_id = $1',
            [req.user.id]
        );
        
        if (staffRows.length === 0) {
            return res.json({ message: 'success', data: [] });
        }
        
        const staffId = staffRows[0].id;
        
        // جلب الطلبات المعينة لهذا الديليفري
        const { rows } = await query(`
            SELECT o.*, oa.status as assignment_status, oa.assigned_at, 
                   oa.picked_up_at, oa.delivered_at, oa.rejection_reason,
                   u.name as customer_name, u.email as customer_email
            FROM orders o
            JOIN order_assignments oa ON o.id = oa.order_id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE oa.delivery_staff_id = $1 
              AND oa.status IN ('assigned', 'picked_up', 'arriving')
            ORDER BY oa.assigned_at DESC
        `, [staffId]);
        
        res.json({ message: 'success', data: rows });
    } catch (err) {
        console.error('Error fetching delivery orders:', err);
        res.status(500).json({ error: err.message });
    }
});

// الديليفري وصل - في انتظار العميل
router.post('/arriving-order/:orderId', verifyToken, async (req, res) => {
    const { orderId } = req.params;
    
    try {
        await query(`
            UPDATE order_assignments 
            SET status = 'arriving', arriving_at = CURRENT_TIMESTAMP
            WHERE order_id = $1
        `, [orderId]);
        
        // تحديث حالة الطلب الرئيسي
        await query("UPDATE orders SET status = 'arriving' WHERE id = $1", [orderId]);
        
        res.json({ message: 'success', status: 'arriving' });
    } catch (err) {
        console.error('Error updating arriving status:', err);
        res.status(400).json({ error: err.message });
    }
});

// الديليفري يرفض الطلب
router.post('/reject-order/:orderId', verifyToken, async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    try {
        await query('BEGIN');
        
        // جلب معرف الديليفري
        const { rows: assignmentRows } = await query(
            'SELECT delivery_staff_id FROM order_assignments WHERE order_id = $1',
            [orderId]
        );
        
        // تحديث سجل التعيين
        await query(`
            UPDATE order_assignments 
            SET status = 'rejected', 
                rejection_reason = $2, 
                rejected_at = CURRENT_TIMESTAMP
            WHERE order_id = $1
        `, [orderId, reason]);
        
        // تحديث حالة الطلب
        await query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [orderId]);
        
        // تقليل عدد الطلبات للديليفري
        if (assignmentRows.length > 0 && assignmentRows[0].delivery_staff_id) {
            await query(`
                UPDATE delivery_staff SET current_orders = GREATEST(0, current_orders - 1) 
                WHERE id = $1
            `, [assignmentRows[0].delivery_staff_id]);
        }
        
        await query('COMMIT');
        res.json({ message: 'success', status: 'rejected' });
    } catch (err) {
        await query('ROLLBACK');
        console.error('Error rejecting order:', err);
        res.status(400).json({ error: err.message });
    }
});

// ============================================
// الفروع مع بيانات التواصل
// ============================================

// تحديث بيانات الفرع (إضافة أرقام التواصل والموقع)
router.put('/branches/:id/contact', [verifyToken, isAdmin], async (req, res) => {
    const { id } = req.params;
    const { phone, phone2, mapsLink, address } = req.body;
    
    try {
        const { rows } = await query(`
            UPDATE branches 
            SET phone = COALESCE($1, phone),
                phone2 = COALESCE($2, phone2),
                maps_link = COALESCE($3, maps_link),
                address = COALESCE($4, address)
            WHERE id = $5
            RETURNING *
        `, [phone, phone2, mapsLink, address, id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Branch not found' });
        }
        
        res.json({ message: 'success', data: rows[0] });
    } catch (err) {
        console.error('Error updating branch contact:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
