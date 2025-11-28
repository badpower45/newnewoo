# 🧪 Testing Guide - E-commerce System

## Quick System Test Checklist

### ✅ Pre-requisites
- [ ] PostgreSQL Database is running (Supabase)
- [ ] `.env` file configured with correct DB credentials
- [ ] Node.js packages installed (`npm install` in both root and `/server`)

---

## 🚀 Starting the System

### 1. Start Backend Server
```bash
cd server
npm start
# Should see:
# ✅ Connected to PostgreSQL database
# Server is running on port 3001
# Socket.io is ready for connections
```

### 2. Start Frontend Dev Server
```bash
npm run dev
# Should see:
# VITE ready in X ms
# Local: http://localhost:5173
```

---

## 🧪 Test Cases

### Test 1: Database Connection ✅
```bash
# Check server console output
# Should see: "✅ Connected to PostgreSQL database"
```

### Test 2: User Registration ✅
1. Navigate to `http://localhost:5173/register`
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click Register
4. ✅ Should redirect to homepage with user logged in

### Test 3: Product Listing ✅
1. Navigate to `http://localhost:5173/products`
2. ✅ Should see products loaded from database
3. ✅ Should see category filters
4. ✅ Should see search bar

### Test 4: Add to Cart ✅
1. Click "Add to Cart" on any product
2. ✅ Cart icon should show item count
3. ✅ Toast notification appears
4. Open cart (click cart icon)
5. ✅ Product appears in cart with correct quantity

### Test 5: Checkout Flow ✅
1. Go to cart with items
2. Click "Proceed to Checkout"
3. Fill delivery details
4. Click "Confirm Order"
5. ✅ Order created successfully message
6. ✅ Cart cleared
7. ✅ Loyalty points awarded

### Test 6: Admin Login ✅
1. Navigate to `http://localhost:5173/login`
2. Login with admin credentials:
   - Email: admin@example.com (create in DB first)
   - Password: admin123
3. Navigate to `http://localhost:5173/admin`
4. ✅ Should see admin dashboard

### Test 7: Product Management (Admin) ✅
1. In admin panel, go to Products
2. ✅ Should see all products
3. ✅ Search functionality works
4. Click delete on a product
5. ✅ Product deleted
6. ✅ Product removed from list

### Test 8: Order Management (Admin) ✅
1. In admin panel, go to Orders
2. ✅ Should see all orders
3. Change order status dropdown
4. ✅ Status updated in database
5. ✅ Customer sees updated status

### Test 9: Live Chat (Customer) ✅
1. As customer, click chat widget (bottom right)
2. Type a message
3. Send message
4. ✅ Message saved to database
5. ✅ Message appears in chat window

### Test 10: Live Chat Dashboard (Admin) ✅
1. In admin panel, go to Live Chat
2. ✅ Should see active conversations
3. Click on a conversation
4. ✅ Messages load
5. Type and send reply
6. ✅ Customer receives message in real-time

### Test 11: Excel Upload (Admin) ✅
1. In admin panel, go to Excel Upload
2. Prepare Excel file with columns:
   - id, name, description, category, image, barcode, weight, branchId, price, stock_quantity
3. Upload file
4. ✅ Products imported successfully
5. ✅ Success/Error messages shown
6. Go to Products page
7. ✅ Imported products appear

### Test 12: Barcode Scanner ✅
1. Go to Products page
2. Click barcode scanner icon
3. Allow camera access
4. Scan product barcode
5. ✅ Product found and displayed
6. ✅ Can add to cart directly

### Test 13: Multi-Branch Support ✅
1. Create multiple branches in database:
```sql
INSERT INTO branches (name, location_lat, location_lng) VALUES 
('Branch 1', 30.0444, 31.2357),
('Branch 2', 31.2001, 29.9187);
```
2. Add products with different prices per branch:
```sql
INSERT INTO branch_products (branch_id, product_id, price, stock_quantity) VALUES
(1, 'prod-1', 50.00, 100),
(2, 'prod-1', 48.00, 50);
```
3. Fetch products with `?branchId=1`
4. ✅ Different prices shown per branch

### Test 14: Guest User Mode ✅
1. Access site without logging in
2. Add products to cart
3. Go to checkout
4. ✅ Auto-login as guest
5. ✅ Order created with guest user ID

### Test 15: Loyalty Points ✅
1. Place order worth 100 EGP
2. Check user profile
3. ✅ 100 loyalty points added
4. Place another order worth 50 EGP
5. ✅ Total points now 150

---

## 🐛 Debugging Tips

### Backend Not Starting?
```bash
# Check PostgreSQL connection
node -e "import('pg').then(({default: pg}) => { 
  const client = new pg.Client({ 
    connectionString: 'YOUR_DB_URL' 
  }); 
  client.connect().then(() => console.log('✅ Connected')).catch(e => console.error('❌', e)); 
})"
```

### Database Schema Not Created?
```bash
# Run schema.sql manually
cd server
psql -h DB_HOST -U DB_USER -d DB_NAME -f schema.sql
```

### Products Not Loading?
1. Check browser console for errors
2. Check network tab for API call
3. Verify `branchId` is passed in query
4. Check if branch_products table has data

### Socket.IO Not Connecting?
1. Check browser console: `Socket connection failed`
2. Verify CORS settings in server/index.js
3. Check if port 3001 is accessible
4. Verify Socket.IO client version matches server

### Admin Can't Access Dashboard?
1. Check user role in database:
```sql
SELECT id, name, email, role FROM users WHERE email = 'admin@example.com';
```
2. Update role if needed:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 📊 Database Queries for Testing

### Create Admin User
```sql
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@example.com', '$2a$08$hashed_password', 'admin');
```

### Check Orders
```sql
SELECT o.id, o.total, o.status, u.name as customer_name 
FROM orders o 
JOIN users u ON o.user_id = u.id 
ORDER BY o.date DESC 
LIMIT 10;
```

### Check Cart Items
```sql
SELECT c.*, p.name as product_name, u.name as user_name 
FROM cart c 
JOIN products p ON c.product_id = p.id 
JOIN users u ON c.user_id = u.id;
```

### Check Chat Messages
```sql
SELECT m.*, c.customer_name 
FROM messages m 
JOIN conversations c ON m.conversation_id = c.id 
ORDER BY m.timestamp DESC 
LIMIT 20;
```

### Check Loyalty Points
```sql
SELECT id, name, email, loyalty_points 
FROM users 
WHERE loyalty_points > 0 
ORDER BY loyalty_points DESC;
```

---

## ✅ All Tests Passed?

If all tests pass:
- ✅ Frontend connected to Backend
- ✅ Backend connected to Database
- ✅ Admin Dashboard fully functional
- ✅ E-commerce flow complete
- ✅ Real-time chat working
- ✅ Multi-branch system operational

### 🎉 System is Production Ready!

---

## 📝 Next Steps

1. Add more products to database
2. Configure email notifications
3. Add payment gateway integration
4. Set up automated backups
5. Configure SSL certificates
6. Deploy to production server
7. Set up monitoring (Sentry, LogRocket)
8. Add analytics (Google Analytics)

---

**Last Updated:** November 28, 2025
**Status:** ✅ All Systems Operational
