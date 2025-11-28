# 📋 خطة تنفيذ مشروع Lumina Fresh Market
**دليل التاسكات الشامل - من الصفر للإطلاق**

---

## 🎯 نظرة عامة

هذا الملف يحتوي على **خريطة تنفيذ كاملة** لمشروع Lumina Fresh Market، مقسمة إلى:
- **8 مراحل رئيسية (Epics)**
- **85+ مهمة فرعية (Tasks)**
- **تقدير زمني لكل مرحلة**

### رموز الحالة:
- ✅ مكتمل (Done)
- 🔄 قيد العمل (In Progress)
- ⏳ قريباً (Next)
- 📌 مخطط (Planned)
- 🔴 عاجل/حرج (Critical)

---

## 📊 ملخص المراحل

| المرحلة | المدة المتوقعة | الأولوية | الحالة |
|---------|----------------|---------|--------|
| **المرحلة 0: الإعداد والأمان** | 1-2 يوم | 🔴 عاجل | ⏳ قريباً |
| **المرحلة 1: Backend Core** | 5-7 أيام | عالي | ✅ جزئياً |
| **المرحلة 2: Frontend Core** | 7-10 أيام | عالي | ✅ جزئياً |
| **المرحلة 3: التجارة الإلكترونية** | 5-7 أيام | عالي | ✅ جزئياً |
| **المرحلة 4: Admin Dashboard** | 4-6 أيام | متوسط | ✅ جزئياً |
| **المرحلة 5: Live Chat & Support** | 3-4 أيام | متوسط | ✅ جزئياً |
| **المرحلة 6: Grocery Specifics** | 7-10 أيام | عالي | 📌 مخطط |
| **المرحلة 7: Deployment & Testing** | 3-5 أيام | عالي | 📌 مخطط |
| **المرحلة 8: Post-Launch** | مستمر | متوسط | 📌 مخطط |

**إجمالي الوقت المتوقع:** 35-51 يوم عمل (~7-10 أسابيع)

---

## 🔴 المرحلة 0: الإعداد والأمان (Setup & Security)
**المدة:** 1-2 يوم | **الأولوية:** 🔴 عاجل جداً

### الأهداف:
معالجة الثغرات الأمنية الحرجة وإعداد بيئة العمل بشكل صحيح.

### المهام:

#### 0.1 معالجة ثغرة الـ Database Credentials
- [ ] **0.1.1** حذف ملف `.env` من Git
  ```bash
  git rm --cached .env
  git rm --cached server/.env
  git commit -m "Remove sensitive files"
  ```
- [ ] **0.1.2** إضافة `.env` و `server/.env` إلى `.gitignore`
- [ ] **0.1.3** تدوير Database Password في Supabase
  - تسجيل دخول Supabase Dashboard
  - Project Settings → Database → Reset Password
  - تحديث الـ Connection String في ملف `.env` الجديد (المحلي فقط)
- [ ] **0.1.4** إنشاء `.env.example` و `server/.env.example` (بقيم وهمية)
  ```bash
  DATABASE_URL=postgresql://user:password@host:port/db
  JWT_SECRET=your-secret-key-here
  ```

#### 0.2 تأمين JWT Secret
- [ ] **0.2.1** توليد JWT Secret قوي
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] **0.2.2** تحديث `server/.env` بالـ Secret الجديد
- [ ] **0.2.3** التأكد من عدم وجود Secret مكتوب صراحة في الكود

#### 0.3 إعداد بيئة العمل
- [ ] **0.3.1** التأكد من تثبيت Dependencies
  ```bash
  # Frontend
  npm install

  # Backend
  cd server && npm install
  ```
- [ ] **0.3.2** اختبار الاتصال بقاعدة البيانات
  ```bash
  cd server && npm run dev
  # يجب أن يظهر: "Connected to PostgreSQL"
  ```
- [ ] **0.3.3** اختبار Frontend
  ```bash
  npm run dev
  # افتح http://localhost:5173
  ```

#### 0.4 Git & Version Control
- [ ] **0.4.1** إنشاء `.gitignore` شامل إن لم يكن موجوداً
  ```
  node_modules/
  .env
  .env.local
  dist/
  build/
  *.log
  .DS_Store
  ```
- [ ] **0.4.2** عمل Commit نظيف بعد التعديلات الأمنية
- [ ] **0.4.3** إنشاء Branch جديد للتطوير (`dev` أو `feature/security-fixes`)

---

## 🏗️ المرحلة 1: Backend Core (النواة الخلفية)
**المدة:** 5-7 أيام | **الأولوية:** عالي

### الأهداف:
بناء الـ API الأساسية وقاعدة البيانات بشكل كامل.

### المهام:

#### 1.1 Database Schema
- [x] **1.1.1** إنشاء ملف `schema.sql` (موجود ✅)
- [ ] **1.1.2** تنفيذ Schema على Supabase
  - الدخول لـ SQL Editor في Supabase
  - نسخ محتوى `schema.sql` وتشغيله
- [ ] **1.1.3** إضافة جدول `delivery_slots` (من القسم الجديد)
  ```sql
  CREATE TABLE delivery_slots (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_orders INTEGER DEFAULT 20,
    delivery_fee DECIMAL(10,2) DEFAULT 15.00,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(branch_id, date, start_time)
  );
  ```
- [ ] **1.1.4** إضافة `reserved_quantity` لجدول `branch_products`
  ```sql
  ALTER TABLE branch_products
  ADD COLUMN reserved_quantity INTEGER DEFAULT 0;
  ```
- [ ] **1.1.5** إضافة `delivery_slot_id` لجدول `orders`
  ```sql
  ALTER TABLE orders
  ADD COLUMN delivery_slot_id INTEGER REFERENCES delivery_slots(id),
  ADD COLUMN payment_method VARCHAR(20) DEFAULT 'cod',
  ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN payment_transaction_id TEXT;
  ```
- [ ] **1.1.6** إنشاء Indexes للأداء
  ```sql
  CREATE INDEX idx_delivery_slots_date ON delivery_slots(date);
  CREATE INDEX idx_orders_status ON orders(status);
  CREATE INDEX idx_orders_user ON orders(user_id);
  ```

#### 1.2 Authentication API
- [x] **1.2.1** POST `/api/auth/register` (موجود ✅)
- [x] **1.2.2** POST `/api/auth/login` (موجود ✅)
- [ ] **1.2.3** GET `/api/auth/me` (جلب بيانات المستخدم الحالي)
- [ ] **1.2.4** POST `/api/auth/logout` (إبطال Token - اختياري)
- [ ] **1.2.5** POST `/api/auth/refresh-token` (تجديد Token)
- [ ] **1.2.6** اختبار Authentication Flow
  - تسجيل مستخدم جديد
  - تسجيل دخول
  - محاولة الوصول لـ Protected Route
  - التحقق من عمل JWT Middleware

#### 1.3 Products API
- [x] **1.3.1** GET `/api/products` (موجود ✅)
- [x] **1.3.2** GET `/api/products/:id` (موجود ✅)
- [x] **1.3.3** GET `/api/products/barcode/:barcode` (موجود ✅)
- [ ] **1.3.4** POST `/api/products` (Admin فقط)
- [ ] **1.3.5** PUT `/api/products/:id` (Admin فقط)
- [ ] **1.3.6** DELETE `/api/products/:id` (Admin فقط)
- [ ] **1.3.7** GET `/api/products/category/:category` (فلترة حسب الفئة)
- [ ] **1.3.8** GET `/api/products/search?q=...` (بحث)

#### 1.4 Branch Products API (Multi-Branch Support)
- [ ] **1.4.1** GET `/api/branch-products/:branchId` (منتجات فرع معين)
- [ ] **1.4.2** POST `/api/branch-products` (ربط منتج بفرع + سعر + مخزون)
- [ ] **1.4.3** PUT `/api/branch-products/:branchId/:productId` (تحديث السعر/المخزون)
- [ ] **1.4.4** DELETE `/api/branch-products/:branchId/:productId` (إزالة منتج من فرع)

#### 1.5 Cart API
- [x] **1.5.1** GET `/api/cart/:userId` (موجود ✅)
- [x] **1.5.2** POST `/api/cart` (موجود ✅)
- [x] **1.5.3** PUT `/api/cart/:cartItemId` (موجود ✅)
- [x] **1.5.4** DELETE `/api/cart/:cartItemId` (موجود ✅)
- [x] **1.5.5** DELETE `/api/cart/user/:userId` (موجود ✅)
- [ ] **1.5.6** إضافة دعم `substitution_preference` في Cart Items
  ```sql
  ALTER TABLE cart
  ADD COLUMN substitution_preference VARCHAR(50) DEFAULT 'call_me';
  ```

#### 1.6 Orders API
- [x] **1.6.1** POST `/api/orders` (إنشاء طلب - موجود ✅)
- [x] **1.6.2** GET `/api/orders/:userId` (طلبات المستخدم - موجود ✅)
- [ ] **1.6.3** GET `/api/orders` (جميع الطلبات - Admin فقط)
- [ ] **1.6.4** PUT `/api/orders/:orderId/status` (تحديث حالة الطلب)
- [ ] **1.6.5** GET `/api/orders/:orderId` (تفاصيل طلب واحد)
- [ ] **1.6.6** تنفيذ Inventory Reservation Logic
  - عند إنشاء طلب: `reserved_quantity += item.quantity`
  - عند التأكيد: `stock_quantity -= quantity, reserved_quantity -= quantity`
  - عند الإلغاء: `reserved_quantity -= quantity`

#### 1.7 Delivery Slots API (جديد)
- [ ] **1.7.1** GET `/api/delivery-slots/:branchId?date=YYYY-MM-DD` (عرض Slots متاحة)
- [ ] **1.7.2** POST `/api/delivery-slots` (إنشاء Slot - Admin فقط)
- [ ] **1.7.3** PUT `/api/delivery-slots/:slotId` (تعديل Slot)
- [ ] **1.7.4** DELETE `/api/delivery-slots/:slotId` (حذف Slot)
- [ ] **1.7.5** إنشاء Cron Job لتوليد Slots تلقائياً (7 أيام قادمة)
  ```javascript
  // كل يوم الساعة 00:00، أنشئ Slots لليوم الثامن
  cron.schedule('0 0 * * *', generateSlots);
  ```

#### 1.8 Branches API
- [ ] **1.8.1** GET `/api/branches` (جميع الفروع)
- [ ] **1.8.2** GET `/api/branches/:id` (فرع محدد)
- [ ] **1.8.3** POST `/api/branches` (إضافة فرع - Admin)
- [ ] **1.8.4** PUT `/api/branches/:id` (تحديث فرع)
- [ ] **1.8.5** GET `/api/branches/nearby?lat=...&lng=...` (الفروع القريبة)

#### 1.9 Users API
- [ ] **1.9.1** GET `/api/users/:id` (معلومات مستخدم)
- [ ] **1.9.2** PUT `/api/users/:id` (تحديث البيانات)
- [ ] **1.9.3** GET `/api/users` (جميع المستخدمين - Admin)
- [ ] **1.9.4** PUT `/api/users/:id/loyalty-points` (تحديث نقاط الولاء)

---

## 🎨 المرحلة 2: Frontend Core (الواجهة الأساسية)
**المدة:** 7-10 أيام | **الأولوية:** عالي

### الأهداف:
بناء الصفحات الأساسية وتجربة المستخدم.

### المهام:

#### 2.1 Setup & Configuration
- [x] **2.1.1** إعداد Vite + React + TypeScript (موجود ✅)
- [x] **2.1.2** إعداد Tailwind CSS (موجود ✅)
- [x] **2.1.3** إعداد React Router (موجود ✅)
- [ ] **2.1.4** إعداد Environment Variables
  ```
  VITE_API_URL=http://localhost:3001/api
  VITE_SOCKET_URL=http://localhost:3001
  ```
- [ ] **2.1.5** إنشاء `src/config.ts` لتخزين الـ constants
  ```typescript
  export const API_URL = import.meta.env.VITE_API_URL;
  export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
  ```

#### 2.2 Context & State Management
- [x] **2.2.1** AuthContext (موجود ✅)
- [x] **2.2.2** CartContext (موجود ✅)
- [x] **2.2.3** FavoritesContext (موجود ✅)
- [ ] **2.2.4** BranchContext (لتخزين الفرع المختار)
- [ ] **2.2.5** دمج Cart مع Backend API بدلاً من localStorage للمستخدمين المسجلين

#### 2.3 Shared Components
- [x] **2.3.1** Header (موجود ✅)
- [x] **2.3.2** Footer (موجود ✅)
- [x] **2.3.3** ProductCard (موجود ✅)
- [ ] **2.3.4** Loading Spinner
- [ ] **2.3.5** Error Message Component
- [ ] **2.3.6** Toast Notifications (لرسائل النجاح/الخطأ)
- [ ] **2.3.7** Modal Component (عام)
- [ ] **2.3.8** Breadcrumb Component
- [ ] **2.3.9** Pagination Component

#### 2.4 Authentication Pages
- [x] **2.4.1** LoginPage (موجود ✅)
- [x] **2.4.2** RegisterPage (موجود ✅)
- [ ] **2.4.3** Protected Route Component
  ```tsx
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
  ```
- [ ] **2.4.4** Redirect Logic بعد Login
- [ ] **2.4.5** Logout Functionality

#### 2.5 Home Page
- [x] **2.5.1** Hero Section (Bento Grid) (موجود ✅)
- [x] **2.5.2** Fresh Products Section (موجود ✅)
- [x] **2.5.3** Promo Banners (موجود ✅)
- [x] **2.5.4** Pantry Products Section (موجود ✅)
- [x] **2.5.5** Snacks Section (موجود ✅)
- [x] **2.5.6** Magazine Offers Carousel (موجود ✅)
- [x] **2.5.7** Reels/Videos Section (موجود ✅)
- [ ] **2.5.8** ربط المنتجات بالـ Backend API بدلاً من Mock Data

#### 2.6 Products Pages
- [x] **2.6.1** ProductsPage (قائمة المنتجات - موجود ✅)
- [ ] **2.6.2** إضافة Filters (Category, Price Range)
- [ ] **2.6.3** إضافة Sorting (السعر، التقييم، الأحدث)
- [ ] **2.6.4** Search Functionality
- [x] **2.6.5** ProductDetailsPage (موجود ✅)
- [ ] **2.6.6** Product Reviews & Ratings (عرض فقط)
- [ ] **2.6.7** "منتجات مشابهة" في صفحة التفاصيل

#### 2.7 Cart & Checkout
- [x] **2.7.1** CartPage (موجود ✅)
- [x] **2.7.2** CheckoutPage (موجود ✅)
- [ ] **2.7.3** إضافة Delivery Slot Selection في Checkout
  ```tsx
  <DeliverySlotPicker
    branchId={selectedBranch}
    onSelect={(slot) => setDeliverySlot(slot)}
  />
  ```
- [ ] **2.7.4** إضافة Payment Method Selection
  - Cash on Delivery (COD)
  - Online Payment (Fawry - مرحلة لاحقة)
- [ ] **2.7.5** Order Summary Component
- [ ] **2.7.6** Address Input (عنوان التوصيل)
- [ ] **2.7.7** Substitution Preferences لكل منتج في السلة
  ```tsx
  <Select>
    <option>اتصل بي أولاً</option>
    <option>استبدل بمنتج مشابه</option>
    <option>الغِ هذا المنتج</option>
  </Select>
  ```

#### 2.8 User Profile
- [x] **2.8.1** ProfilePage (موجود ✅)
- [ ] **2.8.2** تعديل البيانات الشخصية
- [ ] **2.8.3** عرض نقاط الولاء
- [ ] **2.8.4** سجل الطلبات السابقة
- [ ] **2.8.5** تتبع الطلب الحالي

#### 2.9 Favorites
- [x] **2.9.1** FavoritesPage (موجود ✅)
- [ ] **2.9.2** ربط Favorites بالـ Backend (حالياً localStorage فقط)

---

## 🛒 المرحلة 3: التجارة الإلكترونية (E-commerce Features)
**المدة:** 5-7 أيام | **الأولوية:** عالي

### الأهداف:
تفعيل الميزات التجارية الكاملة (طلبات، دفع، مخزون).

### المهام:

#### 3.1 Order Flow
- [ ] **3.1.1** تنفيذ Order Creation مع Inventory Reservation
- [ ] **3.1.2** إرسال Email/SMS تأكيد الطلب (اختياري)
- [ ] **3.1.3** صفحة Order Confirmation ("شكراً لك، طلبك رقم #123")
- [ ] **3.1.4** صفحة Order Tracking
  ```
  الطلب #123
  ⏳ بانتظار التأكيد → ✅ تم التأكيد → 🔄 جاري التحضير → 🚚 في الطريق → 🎉 تم التوصيل
  ```
- [ ] **3.1.5** تحديث حالة الطلب من Admin Panel

#### 3.2 Inventory Management
- [ ] **3.2.1** عرض "متوفر/غير متوفر" في ProductCard
- [ ] **3.2.2** منع إضافة منتج للسلة إذا `stock_quantity - reserved_quantity <= 0`
- [ ] **3.2.3** تحديث المخزون في الوقت الفعلي عند إنشاء/إلغاء طلب
- [ ] **3.2.4** Cron Job لإلغاء الحجز (Reservation) بعد 30 دقيقة من إنشاء الطلب إذا لم يتم الدفع
  ```javascript
  // كل 5 دقائق، ابحث عن طلبات pending > 30 min
  cron.schedule('*/5 * * * *', releaseExpiredReservations);
  ```

#### 3.3 Payment Integration (COD أولاً)
- [ ] **3.3.1** إضافة "الدفع عند الاستلام" كخيار افتراضي
- [ ] **3.3.2** تحديث `payment_method` و `payment_status` في Orders table
- [ ] **3.3.3** إعداد لـ Fawry Integration (مرحلة لاحقة - Phase 2)
  - إنشاء حساب Fawry
  - الحصول على API Keys
  - قراءة Documentation

#### 3.4 Multi-Branch Support
- [ ] **3.4.1** Branch Selection Modal في أول زيارة
  ```tsx
  <BranchSelector
    branches={branches}
    onSelect={(branch) => setSelectedBranch(branch)}
  />
  ```
- [ ] **3.4.2** حفظ الفرع المختار في BranchContext + localStorage
- [ ] **3.4.3** عرض أسعار ومخزون الفرع المختار فقط
- [ ] **3.4.4** إمكانية تغيير الفرع من الـ Header
- [ ] **3.4.5** حساب "الفرع الأقرب" باستخدام Geolocation (اختياري)

#### 3.5 Delivery Slots
- [ ] **3.5.1** إنشاء `DeliverySlotPicker` Component
- [ ] **3.5.2** عرض Slots المتاحة من API
- [ ] **3.5.3** تحديث `current_orders` عند حجز Slot
- [ ] **3.5.4** منع الحجز إذا الـ Slot ممتلئ
- [ ] **3.5.5** عرض رسوم التوصيل حسب الـ Slot المختار

---

## 👨‍💼 المرحلة 4: Admin Dashboard (لوحة التحكم)
**المدة:** 4-6 أيام | **الأولوية:** متوسط

### الأهداف:
بناء لوحة تحكم كاملة لإدارة المنتجات، الطلبات، والموظفين.

### المهام:

#### 4.1 Dashboard Layout
- [x] **4.1.1** AdminLayout Component (Sidebar + Header - موجود ✅)
- [ ] **4.1.2** Protected Admin Routes (التحقق من `role === 'admin'`)
- [ ] **4.1.3** Sidebar Navigation
  - Dashboard
  - المنتجات
  - الطلبات
  - الموظفين
  - الدردشات
  - الإحصائيات
  - الإعدادات

#### 4.2 Dashboard Overview
- [x] **4.2.1** DashboardPage (موجود ✅)
- [ ] **4.2.2** Stats Cards (إجمالي الطلبات، المبيعات، العملاء)
- [ ] **4.2.3** Recent Orders Table
- [ ] **4.2.4** Sales Chart (اختياري - مرحلة لاحقة)
- [ ] **4.2.5** Top Products

#### 4.3 Products Management
- [x] **4.3.1** ProductsManager Page (موجود ✅)
- [ ] **4.3.2** عرض جميع المنتجات في Table
- [ ] **4.3.3** Add Product Modal/Form
  - اسم المنتج
  - الفئة
  - الوصف
  - الوزن
  - Barcode
  - صورة (رفع من الجهاز)
- [ ] **4.3.4** Edit Product Modal
- [ ] **4.3.5** Delete Product (مع تأكيد)
- [ ] **4.3.6** Excel Upload (Bulk Import)
  ```tsx
  <input type="file" accept=".xlsx" onChange={handleExcelUpload} />
  ```
  - استخدام `xlsx` library
  - قراءة الصفوف وإنشاء منتجات

#### 4.4 Branch Products Management
- [ ] **4.4.1** صفحة إدارة المخزون لكل فرع
- [ ] **4.4.2** تحديد السعر والمخزون لكل منتج في كل فرع
- [ ] **4.4.3** Bulk Update (تحديث عدة منتجات دفعة واحدة)

#### 4.5 Orders Management
- [x] **4.5.1** OrdersManager Page (موجود ✅)
- [ ] **4.5.2** عرض جميع الطلبات
- [ ] **4.5.3** فلترة حسب:
  - الحالة (pending, confirmed, delivered, etc.)
  - التاريخ
  - الفرع
- [ ] **4.5.4** Order Details Modal
  - بيانات العميل
  - المنتجات
  - العنوان
  - الـ Delivery Slot
  - حالة الدفع
- [ ] **4.5.5** تحديث حالة الطلب
  ```tsx
  <Select value={order.status} onChange={updateOrderStatus}>
    <option>pending</option>
    <option>confirmed</option>
    <option>preparing</option>
    <option>out_for_delivery</option>
    <option>delivered</option>
  </Select>
  ```
- [ ] **4.5.6** Print Invoice (طباعة الفاتورة - اختياري)

#### 4.6 Employees Management
- [x] **4.6.1** EmployeesManager Page (موجود ✅)
- [ ] **4.6.2** عرض جميع الموظفين
- [ ] **4.6.3** Add Employee Form
  - الاسم
  - البريد الإلكتروني
  - الدور (employee, manager, admin)
  - الفرع الافتراضي
- [ ] **4.6.4** Edit Employee
- [ ] **4.6.5** Deactivate Employee (تعطيل حساب)

#### 4.7 Branches Management (اختياري)
- [ ] **4.7.1** صفحة إدارة الفروع
- [ ] **4.7.2** إضافة فرع جديد
- [ ] **4.7.3** تحديد الموقع على الخريطة (Geolocation)
- [ ] **4.7.4** تعيين نطاق التوصيل

---

## 💬 المرحلة 5: Live Chat & Support (الدردشة المباشرة)
**المدة:** 3-4 أيام | **الأولوية:** متوسط

### الأهداف:
تفعيل نظام الدعم الفني عبر الدردشة المباشرة.

### المهام:

#### 5.1 Socket.io Setup
- [x] **5.1.1** إعداد Socket.io Server (موجود ✅)
- [x] **5.1.2** إعداد Socket.io Client (موجود ✅)
- [ ] **5.1.3** اختبار الاتصال
  ```javascript
  socket.on('connect', () => console.log('Connected!'));
  ```

#### 5.2 Chat Backend
- [x] **5.2.1** Conversations & Messages Tables (موجود ✅)
- [x] **5.2.2** POST `/api/chat/conversations` (موجود ✅)
- [x] **5.2.3** GET `/api/chat/conversations/:id/messages` (موجود ✅)
- [ ] **5.2.4** Socket Events:
  - `send_message`
  - `receive_message`
  - `typing`
  - `user_typing`
  - `assign_conversation` (تخصيص محادثة لموظف)

#### 5.3 Chat Frontend (Customer)
- [x] **5.3.1** ChatWidget Component (موجود ✅)
- [x] **5.3.2** ChatWindow Component (موجود ✅)
- [ ] **5.3.3** ربط Socket.io بالـ Components
- [ ] **5.3.4** إرسال/استقبال الرسائل
- [ ] **5.3.5** Typing Indicator
- [ ] **5.3.6** عرض تاريخ المحادثات السابقة
- [ ] **5.3.7** حفظ المحادثة في localStorage للزوار

#### 5.4 Chat Dashboard (Admin/Support)
- [x] **5.4.1** ChatDashboard Page (موجود ✅)
- [ ] **5.4.2** عرض جميع المحادثات
- [ ] **5.4.3** فلترة حسب الحالة (active, closed)
- [ ] **5.4.4** Assign Conversation لموظف معين
- [ ] **5.4.5** الرد على الرسائل
- [ ] **5.4.6** إغلاق محادثة

---

## 🥬 المرحلة 6: Grocery Specifics (ميزات البقالة)
**المدة:** 7-10 أيام | **الأولوية:** عالي

### الأهداف:
تنفيذ الميزات الخاصة بطبيعة البقالة (البدائل، المنتجات الموزونة، إلخ).

### المهام:

#### 6.1 Substitution Preferences
- [ ] **6.1.1** إضافة `substitution_preference` لجدول `cart` و `order_items`
  ```sql
  ALTER TABLE cart
  ADD COLUMN substitution_preference VARCHAR(50) DEFAULT 'call_me';

  -- وكذلك في JSONB الخاص بـ order items
  ```
- [ ] **6.1.2** UI في Cart لاختيار التفضيل لكل منتج
- [ ] **6.1.3** عرض التفضيلات في Admin Panel عند تحضير الطلب
- [ ] **6.1.4** إشعار الموظف إذا كان الخيار "اتصل بي"

#### 6.2 Variable Weight Products
- [ ] **6.2.1** إضافة `is_weighted` flag لجدول `products`
  ```sql
  ALTER TABLE products
  ADD COLUMN is_weighted BOOLEAN DEFAULT FALSE;
  ```
- [ ] **6.2.2** UI لعرض "سعر تقديري" في ProductCard
  ```tsx
  {product.is_weighted && (
    <p className="text-sm text-gray-500">
      السعر التقديري (قد يختلف ±5%)
    </p>
  )}
  ```
- [ ] **6.2.3** إضافة حقول `ordered_weight` و `actual_weight` في Order Items
- [ ] **6.2.4** واجهة Admin لتحديث الوزن الفعلي
- [ ] **6.2.5** إعادة حساب السعر النهائي
- [ ] **6.2.6** إشعار العميل بالسعر النهائي (SMS/Email/In-App)

#### 6.3 Delivery Slots (Advanced)
- [ ] **6.3.1** Slot Availability Check في الوقت الفعلي
- [ ] **6.3.2** منع الحجز المزدوج (Race Condition Handling)
  ```sql
  -- استخدام Transaction + Lock
  BEGIN;
  SELECT * FROM delivery_slots WHERE id = $1 FOR UPDATE;
  -- تحقق من current_orders < max_orders
  UPDATE delivery_slots SET current_orders = current_orders + 1;
  COMMIT;
  ```
- [ ] **6.3.3** إلغاء الطلب يحرر الـ Slot
- [ ] **6.3.4** Admin: تعديل Capacity للـ Slots

#### 6.4 Image Hosting
- [ ] **6.4.1** إنشاء حساب Cloudinary مجاني
- [ ] **6.4.2** إضافة Cloudinary SDK للـ Backend
  ```bash
  npm install cloudinary
  ```
- [ ] **6.4.3** POST `/api/products/upload-image`
  ```javascript
  const result = await cloudinary.uploader.upload(req.file.path);
  res.json({ imageUrl: result.secure_url });
  ```
- [ ] **6.4.4** تحديث Product Form لرفع الصور
- [ ] **6.4.5** Image Optimization (resize to 800x800, quality 80%)

#### 6.5 Driver Interface (مرحلة لاحقة - Phase 2)
- [ ] **6.5.1** صفحة/تطبيق بسيط للمندوبين
- [ ] **6.5.2** عرض الطلبات المخصصة للمندوب
- [ ] **6.5.3** تفاصيل الطلب (العنوان، المنتجات، المبلغ)
- [ ] **6.5.4** زر "اتصل بالعميل"
- [ ] **6.5.5** تحديث الحالة إلى "out_for_delivery"
- [ ] **6.5.6** تحديث الحالة إلى "delivered" (مع تأكيد)
- [ ] **6.5.7** GPS Tracking (اختياري - مرحلة متقدمة)

---

## 🚀 المرحلة 7: Deployment & Testing (النشر والاختبار)
**المدة:** 3-5 أيام | **الأولوية:** عالي

### الأهداف:
نشر التطبيق على الإنترنت واختباره بشكل كامل.

### المهام:

#### 7.1 Backend Deployment
- [ ] **7.1.1** اختيار مزود الاستضافة
  - **الخيارات:** Render, Railway, DigitalOcean, AWS EC2, Heroku
  - **التوصية:** Render (مجاني لبداية)
- [ ] **7.1.2** إعداد Environment Variables على السيرفر
  ```
  DATABASE_URL=...
  JWT_SECRET=...
  CLOUDINARY_CLOUD_NAME=...
  ```
- [ ] **7.1.3** Deploy Backend
  ```bash
  # على Render: Connect to GitHub Repo
  # Build Command: cd server && npm install
  # Start Command: node index.js
  ```
- [ ] **7.1.4** اختبار APIs من Postman/Thunder Client
- [ ] **7.1.5** إعداد Custom Domain (اختياري)
  - `api.lumina-market.com`

#### 7.2 Frontend Deployment
- [ ] **7.2.1** تحديث `VITE_API_URL` للـ Production URL
  ```
  VITE_API_URL=https://your-backend.render.com/api
  ```
- [ ] **7.2.2** Build Frontend
  ```bash
  npm run build
  # ينشئ مجلد dist/
  ```
- [ ] **7.2.3** Deploy على Netlify
  - ربط GitHub Repo
  - Build command: `npm run build`
  - Publish directory: `dist`
- [ ] **7.2.4** إضافة Environment Variables على Netlify
- [ ] **7.2.5** اختبار الموقع المنشور
- [ ] **7.2.6** إعداد Custom Domain (اختياري)
  - `lumina-market.com` أو `www.lumina-market.com`

#### 7.3 Database (Production)
- [ ] **7.3.1** التأكد من أن Supabase مضبوط على Production Mode
- [ ] **7.3.2** Backups تلقائية (Supabase يوفرها)
- [ ] **7.3.3** إنشاء Read-Only User للإحصائيات (اختياري)

#### 7.4 Testing
- [ ] **7.4.1** اختبار تسجيل الدخول/التسجيل
- [ ] **7.4.2** اختبار إضافة منتجات للسلة
- [ ] **7.4.3** اختبار إنشاء طلب كامل (End-to-End)
- [ ] **7.4.4** اختبار Admin Panel (إضافة منتج، تحديث طلب)
- [ ] **7.4.5** اختبار الدردشة المباشرة
- [ ] **7.4.6** اختبار على أجهزة مختلفة (Mobile, Tablet, Desktop)
- [ ] **7.4.7** Performance Testing (Lighthouse)
  - الهدف: Score > 85
- [ ] **7.4.8** Security Testing
  - SQL Injection
  - XSS
  - CSRF
  - JWT Expiration

#### 7.5 Documentation
- [ ] **7.5.1** كتابة README.md شامل
  - كيفية تشغيل المشروع محلياً
  - Environment Variables المطلوبة
  - Database Setup
- [ ] **7.5.2** API Documentation (Swagger أو Postman Collection)
- [ ] **7.5.3** User Guide (دليل المستخدم - اختياري)
- [ ] **7.5.4** Admin Guide (دليل الإدارة)

---

## 📈 المرحلة 8: Post-Launch (بعد الإطلاق)
**المدة:** مستمر | **الأولوية:** متوسط

### الأهداف:
تحسينات ما بعد الإطلاق، تحليل البيانات، والميزات الإضافية.

### المهام:

#### 8.1 Analytics & Monitoring
- [ ] **8.1.1** إضافة Google Analytics
  ```html
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
  ```
- [ ] **8.1.2** إعداد Sentry لتتبع الأخطاء
- [ ] **8.1.3** Dashboard للإحصائيات في Admin Panel
  - عدد الزوار
  - معدل التحويل (Conversion Rate)
  - متوسط قيمة الطلب (AOV)
  - معدل التخلي عن السلة

#### 8.2 Payment Integration (Fawry)
- [ ] **8.2.1** قراءة Fawry API Documentation
- [ ] **8.2.2** إنشاء Sandbox Account للاختبار
- [ ] **8.2.3** تنفيذ Payment Initiation
  ```javascript
  const fawryResponse = await axios.post(FAWRY_API_URL, {
    merchantCode: process.env.FAWRY_MERCHANT_CODE,
    merchantRefNum: orderId,
    amount: total,
    // ...
  });
  ```
- [ ] **8.2.4** تنفيذ Webhook لاستقبال نتيجة الدفع
  ```javascript
  app.post('/api/webhooks/fawry', (req, res) => {
    // تحديث payment_status
  });
  ```
- [ ] **8.2.5** اختبار في Sandbox
- [ ] **8.2.6** Go Live بعد الموافقة

#### 8.3 Notifications
- [ ] **8.3.1** إعداد Twilio أو SMS Misr للـ SMS
- [ ] **8.3.2** إرسال SMS عند:
  - تأكيد الطلب
  - تغيير حالة الطلب
  - خروج المندوب للتوصيل
- [ ] **8.3.3** إعداد Email Service (SendGrid أو Mailgun)
- [ ] **8.3.4** إرسال Email فاتورة بعد التوصيل
- [ ] **8.3.5** Push Notifications (مرحلة متقدمة - تطبيق موبايل)

#### 8.4 SEO Optimization
- [ ] **8.4.1** إضافة Meta Tags
  ```html
  <meta name="description" content="...">
  <meta property="og:title" content="...">
  <meta property="og:image" content="...">
  ```
- [ ] **8.4.2** إنشاء `sitemap.xml`
- [ ] **8.4.3** إنشاء `robots.txt`
- [ ] **8.4.4** Schema.org Markup للمنتجات
  ```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "بلح سيوي فاخر",
    "price": "65.00",
    "priceCurrency": "EGP"
  }
  </script>
  ```
- [ ] **8.4.5** تحسين سرعة التحميل (Lazy Loading, Code Splitting)

#### 8.5 Advanced Features (Phase 3+)
- [ ] **8.5.1** تطبيق الموبايل (React Native)
- [ ] **8.5.2** برنامج الولاء المتقدم (مستويات، إحالات)
- [ ] **8.5.3** نظام التوصيات بالـ AI
- [ ] **8.5.4** الاشتراكات الشهرية
- [ ] **8.5.5** البحث الصوتي
- [ ] **8.5.6** AR (معاينة المنتجات)

#### 8.6 Security Enhancements
- [ ] **8.6.1** إضافة Rate Limiting
  ```javascript
  import rateLimit from 'express-rate-limit';

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100
  });

  app.use('/api', limiter);
  ```
- [ ] **8.6.2** CSRF Protection
- [ ] **8.6.3** Content Security Policy (CSP)
- [ ] **8.6.4** Security Audit شامل (استخدام OWASP ZAP)
- [ ] **8.6.5** Penetration Testing

---

## 📊 KPIs & Success Metrics

### مؤشرات الإطلاق (Launch Metrics)
بعد أسبوع من الإطلاق:
- [ ] 100 مستخدم مسجل
- [ ] 50 طلب ناجح
- [ ] معدل تحويل > 2%
- [ ] Uptime > 99%
- [ ] Page Load Time < 3s

### مؤشرات الشهر الأول
- [ ] 500 مستخدم نشط
- [ ] 1,000 طلب
- [ ] 300,000 ج.م مبيعات
- [ ] معدل رضا العملاء > 4/5
- [ ] معدل إعادة الطلب > 20%

---

## 🛠️ Tools & Resources

### Development Tools
- **IDE:** VSCode
- **API Testing:** Thunder Client / Postman
- **Database:** Supabase Dashboard
- **Version Control:** Git + GitHub
- **Project Management:** هذا الملف + GitHub Projects (اختياري)

### Design Resources
- **Icons:** Lucide React (مثبت)
- **Fonts:** Cairo, Tajawal (مثبت)
- **Images:** Unsplash (حالياً) → Cloudinary (مستقبلاً)
- **Colors:** راجع PRD.md

### Documentation
- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Vite:** https://vitejs.dev
- **Express:** https://expressjs.com
- **Socket.io:** https://socket.io/docs
- **PostgreSQL:** https://www.postgresql.org/docs
- **Supabase:** https://supabase.com/docs

---

## ✅ Checklist للإطلاق (Launch Checklist)

قبل الإطلاق الرسمي، تأكد من:

### Security
- [ ] جميع Environment Variables محمية (غير موجودة في Git)
- [ ] Database Credentials تم تدويرها
- [ ] JWT Secret قوي ومحمي
- [ ] HTTPS مفعل على الـ Production
- [ ] Rate Limiting مفعل

### Functionality
- [ ] جميع الـ Core Features تعمل
- [ ] لا توجد أخطاء في Console
- [ ] الموقع يعمل على Mobile/Desktop
- [ ] Checkout Flow يعمل من البداية للنهاية
- [ ] Admin Panel يعمل بشكل صحيح

### Performance
- [ ] Lighthouse Score > 85
- [ ] Page Load Time < 3s
- [ ] Images محسنة
- [ ] APIs تستجيب بسرعة (< 500ms)

### Content
- [ ] جميع النصوص بالعربية صحيحة
- [ ] الصور واضحة وعالية الجودة
- [ ] الأسعار محدثة
- [ ] معلومات الاتصال صحيحة

### Legal
- [ ] صفحة الشروط والأحكام (Terms & Conditions)
- [ ] سياسة الخصوصية (Privacy Policy)
- [ ] سياسة الاسترجاع (Return Policy)
- [ ] معلومات الشركة (من نحن)

---

## 🎯 الخطوات التالية (Next Actions)

### الأسبوع الأول:
1. ✅ **اليوم 1-2:** المرحلة 0 (الأمان) 🔴
2. ⏳ **اليوم 3-5:** المرحلة 1 (Backend Core)
3. ⏳ **اليوم 6-7:** بداية المرحلة 2 (Frontend Core)

### الأسبوع الثاني:
4. استكمال المرحلة 2 (Frontend)
5. بداية المرحلة 3 (E-commerce)

### الأسبوع الثالث:
6. استكمال المرحلة 3
7. المرحلة 4 (Admin Dashboard)

### الأسبوع الرابع:
8. المرحلة 5 (Live Chat)
9. بداية المرحلة 6 (Grocery Specifics)

### الأسبوع 5-6:
10. استكمال المرحلة 6
11. المرحلة 7 (Deployment)

---

## 📝 ملاحظات

- **الأولويات قابلة للتغيير** حسب احتياجات العمل
- **التواريخ تقديرية** وقد تختلف حسب وتيرة العمل
- **بعض المهام اختيارية** ومذكورة للتوثيق فقط
- **يمكن العمل على عدة مراحل بالتوازي** (مثلاً: Backend + Frontend)
- **اختبر بشكل مستمر** بعد كل ميزة جديدة

---

## 🎉 بعد الإطلاق

بمجرد إطلاق المشروع:
1. **اجمع Feedback من المستخدمين الأوائل**
2. **أصلح الـ Bugs العاجلة فوراً**
3. **راقب الأداء والـ Analytics**
4. **خطط للميزات التالية** بناءً على احتياجات العملاء
5. **سوّق المنصة** (Social Media, Google Ads, إلخ)

---

**آخر تحديث:** نوفمبر 2025
**الحالة:** قيد التنفيذ النشط
**النسخة:** 1.0

---

<div dir="rtl" style="text-align: center; padding: 20px; background: #23110C; color: white;">
  <h2>🚀 جاهزون لبناء المستقبل خطوة بخطوة</h2>
  <p>Lumina Fresh Market - من الفكرة إلى الواقع</p>
</div>
