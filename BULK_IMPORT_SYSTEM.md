# 🚀 نظام استيراد المنتجات من Excel - دليل المطور

## 📦 المكونات

### Backend (Server)

#### 1. Route Handler - `server/routes/bulkImport.js`
**الوظائف الرئيسية**:
- **POST `/api/products/bulk-import`**: رفع ومعالجة ملف Excel
- **GET `/api/products/bulk-import/template`**: تحميل قالب Excel

**المميزات**:
- ✅ دعم multiple column names (عربي/إنجليزي)
- ✅ معالجة ذكية للبيانات المفقودة (null handling)
- ✅ التحقق من صحة البيانات (validation)
- ✅ Transaction safety (rollback on error)
- ✅ تقرير مفصل (imported/failed/errors)

**Column Mapping**:
```javascript
const COLUMN_MAPPING = {
    'name': ['name', 'product_name', 'اسم المنتج', 'الاسم'],
    'price': ['price', 'السعر', 'سعر'],
    'image': ['image', 'image_url', 'الصورة', 'صورة'],
    'category': ['category', 'القسم', 'الفئة', 'فئة'],
    // ... 13 more optional fields
};
```

#### 2. Integration - `server/index.js`
```javascript
import bulkImportRoutes from './routes/bulkImport.js';
app.use('/api/products', bulkImportRoutes);
```

### Frontend (React + TypeScript)

#### 1. Admin Page - `pages/admin/ProductImporter.tsx`
**المميزات**:
- 🎨 Drag & Drop للملفات
- 📊 عرض النتائج بالتفصيل (نجاح/فشل/أخطاء)
- 📥 تحميل قالب Excel
- 🔄 Upload progress indicator
- ⚠️ File validation (type, size)
- ✅ Success/Error toast messages

**الأقسام**:
1. **Template Download**: تحميل قالب جاهز
2. **Upload Area**: رفع الملف بـ drag & drop
3. **Results Display**: عرض النتائج المفصلة
4. **Instructions**: تعليمات الاستخدام

#### 2. Routing - `App.tsx`
```tsx
import ProductImporter from './pages/admin/ProductImporter';

// In admin routes:
<Route path="product-importer" element={
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
        <ProductImporter />
    </ProtectedRoute>
} />
```

#### 3. Admin Navigation - `pages/admin/AdminLayout.tsx`
```tsx
import { FileSpreadsheet } from 'lucide-react';

{ 
    path: '/admin/product-importer', 
    icon: <FileSpreadsheet size={20} />, 
    label: 'استيراد Excel', 
    roles: ['admin', 'manager'] 
}
```

#### 4. API Client - `services/api.ts`
```typescript
bulkImport: {
    uploadExcel: async (file: File) => { /* ... */ },
    downloadTemplate: async () => { /* ... */ }
}
```

---

## 🔧 كيفية الاستخدام

### للمستخدم (Admin/Manager):

1. **الوصول للصفحة**:
   ```
   Admin Panel → استيراد Excel
   ```

2. **تحميل القالب**:
   - اضغط "تحميل القالب"
   - احصل على `products_template.xlsx`

3. **ملء البيانات**:
   ```excel
   name             | price | image               | category
   ------------------|-------|---------------------|----------
   شوكولاتة جالاكسي | 25.50 | https://...jpg     | حلويات
   بيبسي 2 لتر      | 18.00 | https://...jpg     | مشروبات
   ```

4. **رفع الملف**:
   - اسحب الملف أو اضغط "اختر ملف"
   - اضغط "رفع وإضافة المنتجات"
   - انتظر المعالجة

5. **مراجعة النتائج**:
   - ✅ عدد المنتجات الناجحة
   - ❌ عدد الفشل مع تفاصيل الأخطاء
   - 📊 القائمة الكاملة

### للمطور:

#### إضافة عمود جديد:

1. **في `server/routes/bulkImport.js`**:
```javascript
// Add to COLUMN_MAPPING
'new_field': ['new_field', 'حقل جديد'],

// Add to optional fields
const optionalFields = [..., 'new_field'];

// Add to INSERT query
INSERT INTO products (..., new_field) VALUES (..., $X)
```

2. **في Database**:
```sql
ALTER TABLE products ADD COLUMN new_field VARCHAR(255);
```

#### تخصيص Validation:

```javascript
// In mapRowToProduct function
if (product.new_field) {
    // Custom validation logic
    if (!isValid(product.new_field)) {
        errors.push('Invalid new_field format');
    }
}
```

---

## 📋 Excel Template Structure

### Required Columns (4):
| Column | Type | Example | Validation |
|--------|------|---------|------------|
| name | Text | "شوكولاتة" | Non-empty |
| price | Number | 25.50 | > 0 |
| image | URL | https://... | Valid URL |
| category | Text | "حلويات" | Non-empty |

### Optional Columns (16):
- name_en
- description, description_en
- weight
- barcode, sku
- brand
- stock_quantity
- old_price, discount_percentage
- nutrition_info (JSON)
- ingredients, allergens
- branch_id

---

## 🔐 Security

### Authentication:
```javascript
[verifyToken, isAdmin, upload.single('file')]
```

### File Validation:
```javascript
fileFilter: (req, file, cb) => {
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ];
    // ...
}
```

### Limits:
- File size: 10MB
- Max products per file: 1000 (recommended)

---

## 🐛 Error Handling

### Validation Errors:
```json
{
    "row": 5,
    "data": {...},
    "errors": [
        "Missing required field: price",
        "Invalid image URL"
    ]
}
```

### Import Errors:
```json
{
    "name": "شوكولاتة",
    "error": "Duplicate barcode"
}
```

### Response Format:
```json
{
    "success": true,
    "message": "Successfully imported 150 products",
    "imported": 150,
    "failed": 2,
    "total": 152,
    "details": {
        "imported": [...],
        "validationErrors": [...],
        "importErrors": [...]
    }
}
```

---

## 📊 Database Schema

### Products Table:
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    description_en TEXT,
    category VARCHAR(100) NOT NULL,
    image TEXT NOT NULL,
    weight VARCHAR(50),
    barcode VARCHAR(100),
    sku VARCHAR(100),
    old_price DECIMAL(10, 2),
    discount_percentage INTEGER DEFAULT 0,
    nutrition_info JSONB,
    ingredients TEXT,
    allergens TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Branch Products Table:
```sql
CREATE TABLE branch_products (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id),
    product_id INTEGER REFERENCES products(id),
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, product_id)
);
```

---

## 🧪 Testing

### Manual Test:
1. Navigate to `/admin/product-importer`
2. Download template
3. Fill with test data
4. Upload
5. Verify results

### Test Data Example:
```excel
name            | price | image                  | category
----------------|-------|------------------------|----------
Test Product 1  | 10.00 | https://via.placeholder.com/200 | Test
Test Product 2  | 20.00 | https://via.placeholder.com/200 | Test
```

### Expected Result:
```json
{
    "success": true,
    "imported": 2,
    "failed": 0,
    "total": 2
}
```

---

## 🚀 Deployment

### Vercel:
1. Push to GitHub
2. Auto-deploy triggers
3. Endpoint available at:
   ```
   https://bkaa.vercel.app/api/products/bulk-import
   ```

### Environment Variables:
```env
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production
```

---

## 📝 API Documentation

### POST /api/products/bulk-import

**Request**:
```http
POST /api/products/bulk-import
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [Excel file]
```

**Response (Success)**:
```json
{
    "success": true,
    "message": "Successfully imported 150 products",
    "imported": 150,
    "failed": 2,
    "total": 152,
    "details": {
        "imported": [
            { "id": 1, "name": "...", "category": "...", "price": 25.50 }
        ],
        "validationErrors": [
            { "row": 5, "errors": [...] }
        ],
        "importErrors": [
            { "name": "...", "error": "..." }
        ]
    }
}
```

### GET /api/products/bulk-import/template

**Request**:
```http
GET /api/products/bulk-import/template
Authorization: Bearer {token}
```

**Response**:
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File: `products_template.xlsx`

---

## 🔮 Future Enhancements

1. **Preview Mode**: معاينة البيانات قبل الاستيراد
2. **Batch Processing**: معالجة ملفات كبيرة على دفعات
3. **Progress Tracking**: WebSocket لعرض التقدم الحي
4. **Auto-matching**: ربط تلقائي مع المنتجات الموجودة
5. **Duplicate Detection**: اكتشاف المنتجات المكررة
6. **Image Upload**: رفع الصور مع الملف
7. **Validation Rules**: قواعد تحقق مخصصة per category
8. **Export**: تصدير المنتجات لـ Excel

---

## 📞 Support

للمزيد من المعلومات:
- 📖 دليل المستخدم: `EXCEL_IMPORT_GUIDE.md`
- 📝 ملخص التحسينات: `IMPROVEMENTS_SUMMARY.md`
- 🐛 Report issues: GitHub Issues

---

**Version**: 1.0.0  
**Last Updated**: December 11, 2024  
**Author**: GitHub Copilot
