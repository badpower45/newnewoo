# 📚 دليل نظام المنتجات والتصنيفات والصور المحدث

## 🎯 نظرة عامة

تم ضبط كل شيء بالكامل! النظام يشمل:
1. ✅ **قاعدة البيانات**: المنتجات مربوطة بالتصنيفات بشكل صحيح
2. ✅ **الباك إند**: API endpoints تعمل بكفاءة
3. ✅ **الفرونت إند**: صفحة التصنيفات والمنتجات محدثة
4. ✅ **Cloudinary**: معلومات حسابك الجديدة محدثة
5. ✅ **رفع الصور**: سكريبت جديد يقرأ الصور المدمجة في Excel

---

## 📊 هيكل قاعدة البيانات

### جدول `products` (المنتجات)
```sql
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,                    -- ✅ ربط بالتصنيف (مباشر)
    subcategory TEXT,                 -- ✅ تصنيف فرعي (اختياري)
    rating DECIMAL(3,2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    image TEXT,                       -- ✅ رابط الصورة من Cloudinary
    is_organic BOOLEAN DEFAULT false,
    weight TEXT,
    is_new BOOLEAN DEFAULT false,
    barcode TEXT UNIQUE,
    shelf_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index لتسريع البحث بالتصنيف
CREATE INDEX idx_products_category ON products(category);
```

### جدول `branch_products` (أسعار المنتجات حسب الفرع)
```sql
CREATE TABLE branch_products (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id),
    product_id TEXT REFERENCES products(id),
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    UNIQUE(branch_id, product_id)
);
```

### جدول `categories` (التصنيفات)
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    icon TEXT,
    bg_color VARCHAR(50),
    image TEXT,
    parent_id INTEGER REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0
);
```

---

## 🔌 API Endpoints (الباك إند)

### 📌 `/api/products` - جلب المنتجات

**الطريقة:** GET

**Query Parameters:**
- `branchId` (مطلوب): رقم الفرع
- `category` (اختياري): اسم التصنيف
- `search` (اختياري): كلمة بحث
- `limit` (اختياري): عدد النتائج

**مثال:**
```
GET /api/products?branchId=1&category=ألبان&limit=20
```

**الرد:**
```json
{
  "message": "success",
  "data": [
    {
      "id": "p1001",
      "name": "لبن كامل الدسم 1 لتر",
      "category": "ألبان",
      "price": 25.50,
      "discount_price": 22.00,
      "image": "https://res.cloudinary.com/dwnaacuih/image/upload/v1234/products/p1001.jpg",
      "is_available": true,
      "stock_quantity": 50
    }
  ]
}
```

### 📌 `/api/categories` - جلب التصنيفات

**الطريقة:** GET

**الرد:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ألبان",
      "name_ar": "ألبان",
      "icon": "🥛",
      "bg_color": "bg-blue-50",
      "products_count": 45
    }
  ]
}
```

### 📌 `/api/categories/name/:name` - جلب تصنيف بالاسم

**الطريقة:** GET

**مثال:**
```
GET /api/categories/name/ألبان
```

---

## 🖼️ نظام رفع الصور من Excel (محدث!)

### ✨ الميزة الجديدة: الصور المدمجة

السكريبت الجديد `upload-embedded-images-from-excel.js` يقرأ الصور **المدمجة داخل ملف Excel نفسه** (مش روابط!)

### 📋 خطوات الاستخدام

#### 1️⃣ تثبيت المكتبات المطلوبة

```bash
cd scripts
npm install exceljs cloudinary @supabase/supabase-js dotenv xlsx
```

#### 2️⃣ تحضير ملف Excel

**الأعمدة المطلوبة:**
| Column Name | مطلوب؟ | الوصف |
|-------------|--------|-------|
| `product_id` أو `id` | ✅ نعم | معرف المنتج الفريد |
| `product_name` أو `name` | ✅ نعم | اسم المنتج |
| `category` | ✅ نعم | التصنيف (مثل: ألبان، حلويات) |
| `price` | ❌ اختياري | السعر |
| `description` | ❌ اختياري | الوصف |
| `weight` | ❌ اختياري | الوزن |
| `barcode` | ❌ اختياري | الباركود |
| `subcategory` | ❌ اختياري | التصنيف الفرعي |
| `is_organic` | ❌ اختياري | عضوي؟ (true/false) |
| `is_new` | ❌ اختياري | جديد؟ (true/false) |

**⚠️ مهم جداً:** 
- ضع الصور **مباشرة في الخلايا** (Insert → Picture → Place in Cell)
- كل صورة يجب أن تكون في نفس الصف مع بيانات المنتج
- يفضل وضع الصور في العمود B أو C

**مثال هيكل Excel:**

| product_id | product_name | category | price | (صورة هنا) |
|------------|--------------|----------|-------|------------|
| p1001 | لبن كامل | ألبان | 25.50 | 🖼️ |
| p1002 | أرز بسمتي | بقالة | 45.00 | 🖼️ |

#### 3️⃣ تشغيل السكريبت

```bash
node upload-embedded-images-from-excel.js products.xlsx
```

**خيارات إضافية:**

```bash
# رفع 20 صورة في نفس الوقت (أسرع)
node upload-embedded-images-from-excel.js products.xlsx --batch-size=20

# زيادة الوقت بين الدفعات (3 ثواني)
node upload-embedded-images-from-excel.js products.xlsx --delay=3000

# رفع لفرع معين
node upload-embedded-images-from-excel.js products.xlsx --branch-id=2

# رفع الصور فقط بدون حفظ في الداتابيز
node upload-embedded-images-from-excel.js products.xlsx --skip-db
```

#### 4️⃣ النتيجة

```
🚀 Starting Embedded Images Upload from Excel...

⚙️ Options: { batchSize: 10, delayBetweenBatches: 2000, branchId: 1 }
🔐 Cloudinary Config: { cloud_name: 'dwnaacuih', api_key: '✓ Set' }

📂 Reading Excel file with ExcelJS...
📊 Found 50 data rows
🖼️  Found 50 embedded images

📦 Processing Batch 1/5 (10 products)...
📤 Uploading: p1001 - لبن كامل الدسم
✅ Uploaded: p1001 → https://res.cloudinary.com/dwnaacuih/...
💾 Saved to DB: p1001

═══════════════════════════════════════
📊 UPLOAD SUMMARY
═══════════════════════════════════════
Total products:      50
✅ Uploaded:         48
❌ Failed:           0
⏭️  Skipped:          2
💾 DB Success:       48
⚠️  DB Failed:        0
═══════════════════════════════════════

📈 Success Rate: 100.00%
```

---

## 🌐 معلومات Cloudinary المحدثة

### 🔐 بيانات الحساب

```env
CLOUDINARY_CLOUD_NAME=dwnaacuih
CLOUDINARY_API_KEY=618291128553242
CLOUDINARY_API_SECRET=6EAD1r93PVx9iV8KlL9E2vNH8h4
CLOUDINARY_URL=cloudinary://618291128553242:6EAD1r93PVx9iV8KlL9E2vNH8h4@dwnaacuih
```

### 📂 رابط لوحة التحكم

https://console.cloudinary.com/console/c-xxxx/media_library/folders/products

### 📊 الخطة المجانية

- ✅ 25 GB تخزين
- ✅ 25 GB نقل بيانات شهرياً
- ✅ ضغط تلقائي للصور
- ✅ تحويل الصيغ (WebP, AVIF)
- ✅ تعديل الأبعاد تلقائياً

---

## 💻 صفحة التصنيفات (Frontend)

### 📱 المميزات الحالية

1. ✅ **عرض 3 تصنيفات في الصف** على الموبايل
2. ✅ **بحث نصي**: ابحث عن أي تصنيف
3. ✅ **بحث صوتي**: اضغط على أيقونة الميكروفون
4. ✅ **عرض Grid/List**: تبديل بين عرض الشبكة والقائمة
5. ✅ **عداد المنتجات**: كل تصنيف يعرض عدد المنتجات
6. ✅ **أيقونات ملونة**: كل تصنيف له خلفية لون مميزة

### 🔄 كيف يعمل التكامل؟

**في ملف `CategoriesPage.tsx`:**

```tsx
// 1. جلب التصنيفات من API
const loadCategories = async () => {
    const res = await api.categories.getAll();
    setCategories(res.data);
};

// 2. عند الضغط على تصنيف
<CategoryCard 
    name={cat.name_ar} 
    onClick={() => navigate(`/products?category=${cat.name}`)}
/>
```

**في ملف `ProductsPage.tsx`:**

```tsx
// 3. جلب المنتجات حسب التصنيف
useEffect(() => {
    const category = searchParams.get('category');
    const branchId = selectedBranch?.id;
    
    api.products.getAll({ branchId, category })
        .then(res => setProducts(res.data));
}, [category, selectedBranch]);
```

---

## 🔧 حل المشاكل الشائعة

### ❌ المشكلة: "No embedded images found"

**الحل:**
1. تأكد من تثبيت `exceljs`: `npm install exceljs`
2. تأكد من وضع الصور **داخل الخلايا** (Place in Cell)
3. لا تستخدم "Insert → Picture → Place Over Cells" (خطأ!)
4. استخدم: **Insert → Picture → Place in Cell** ✅

### ❌ المشكلة: "Missing required columns"

**الحل:**
تأكد من وجود هذه الأعمدة:
- `product_id` أو `id`
- `product_name` أو `name`
- `category`

### ❌ المشكلة: "Cloudinary upload failed"

**الحل:**
1. تحقق من صحة API Keys في `.env`
2. تأكد من اتصال الإنترنت
3. تحقق من حجم الصور (يفضل أقل من 10MB)

### ❌ المشكلة: "No products showing in frontend"

**الحل:**
1. تأكد من تحديد `branchId` في الطلب
2. تحقق من وجود `branch_products` للفرع المحدد
3. افحص Console للأخطاء: F12 → Console

---

## 📝 أمثلة كاملة

### مثال 1: رفع 100 منتج مع صور

```bash
# تحضير Excel بـ 100 صف + صور مدمجة
# ثم تشغيل:
node upload-embedded-images-from-excel.js products_100.xlsx --batch-size=25 --delay=1000
```

### مثال 2: إضافة تصنيف جديد

```sql
-- إضافة في الداتابيز
INSERT INTO categories (name, name_ar, icon, bg_color, display_order, is_active)
VALUES ('مجمدات', 'مجمدات', '❄️', 'bg-cyan-50', 10, true);

-- ثم أضف منتجات بـ category = 'مجمدات' في Excel
```

### مثال 3: جلب منتجات تصنيف معين من Frontend

```typescript
// في أي مكان بالكود
const fetchDairyProducts = async () => {
    const response = await fetch(
        `${API_URL}/products?branchId=1&category=ألبان&limit=50`
    );
    const data = await response.json();
    console.log(data.data); // Array of products
};
```

---

## 🎯 ملخص التحديثات

### ✅ ما تم إنجازه

1. **قاعدة البيانات:**
   - ✅ المنتجات مربوطة بالتصنيفات عبر حقل `category`
   - ✅ Index لتسريع استعلامات التصنيف
   - ✅ جدول `branch_products` للأسعار والمخزون

2. **الباك إند:**
   - ✅ API `/products` يدعم الفلترة بالتصنيف
   - ✅ API `/categories` يعرض التصنيفات مع عدد المنتجات
   - ✅ دعم البحث والفلترة

3. **الفرونت إند:**
   - ✅ صفحة التصنيفات محدثة (3 أعمدة موبايل)
   - ✅ صفحة المنتجات تستقبل التصنيف من URL
   - ✅ بحث نصي وصوتي

4. **Cloudinary:**
   - ✅ معلومات الحساب الجديدة محدثة في `.env`
   - ✅ Cloud Name: `dwnaacuih`
   - ✅ API Key مضبوطة

5. **رفع الصور:**
   - ✅ سكريبت جديد للصور المدمجة في Excel
   - ✅ يدعم `exceljs` لقراءة الصور
   - ✅ رفع دفعات + Rate limiting
   - ✅ تكامل مع Supabase

---

## 🚀 الخطوات التالية

### للبدء الآن:

1. **تثبيت المكتبات:**
```bash
cd d:\Coding\project important\test321\newnewoo\scripts
npm install exceljs cloudinary @supabase/supabase-js dotenv
```

2. **تحضير Excel:**
   - افتح Excel جديد
   - أضف الأعمدة: `product_id`, `product_name`, `category`, `price`
   - أدخل صف واحد كمثال
   - أضف صورة في نفس الصف (Insert → Picture → Place in Cell)
   - احفظ الملف: `test_products.xlsx`

3. **تجربة السكريبت:**
```bash
node upload-embedded-images-from-excel.js test_products.xlsx
```

4. **تحقق من النتيجة:**
   - افتح Cloudinary Dashboard
   - تحقق من مجلد `products/`
   - افتح Supabase → Table Editor → `products`
   - تأكد من وجود المنتج بالصورة

5. **افتح التطبيق:**
   - تصفح `/categories`
   - اضغط على أي تصنيف
   - يجب أن تشاهد المنتجات!

---

## 📞 الدعم

في حال واجهت أي مشكلة:
1. تحقق من Console: F12 → Console
2. افحص Network Tab: F12 → Network
3. تحقق من `.env` في مجلد `server/`
4. راجع هذا الملف للحلول

---

**✅ كل شيء مضبوط وجاهز للاستخدام! 🎉**

*آخر تحديث: 13 ديسمبر 2025*
