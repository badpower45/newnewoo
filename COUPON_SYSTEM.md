# 🎯 Coupon System - Complete Guide

## Overview
نظام كوبونات خصم متكامل مع Supabase Edge Functions لأداء أفضل وسرعة أكبر.

---

## 📊 Database Schema

### Table: `coupons`
```sql
- id (serial primary key)
- code (varchar) - كود الكوبون (فريد)
- description (text) - وصف الكوبون
- discount_type (varchar) - نوع الخصم: 'percentage' أو 'fixed'
- discount_value (numeric) - قيمة الخصم (نسبة مئوية أو مبلغ ثابت)
- min_order_value (numeric) - الحد الأدنى للطلب
- max_discount (numeric) - الحد الأقصى للخصم (للنسبة المئوية فقط)
- usage_limit (integer) - حد الاستخدام الكلي
- used_count (integer) - عدد مرات الاستخدام
- per_user_limit (integer) - حد الاستخدام لكل مستخدم
- valid_from (timestamp) - تاريخ البداية
- valid_until (timestamp) - تاريخ الانتهاء
- is_active (boolean) - حالة الكوبون
- created_by (integer) - معرف المنشئ
- created_at (timestamp)
- updated_at (timestamp)
```

### Table: `coupon_usage`
```sql
- id (serial primary key)
- coupon_id (integer) - foreign key to coupons
- user_id (integer) - foreign key to users
- order_id (integer) - foreign key to orders
- discount_amount (numeric) - المبلغ المخصوم
- used_at (timestamp)
```

---

## 🚀 Edge Functions

### 1. validate-coupon
**Purpose:** التحقق من صحة الكوبون وحساب الخصم

**Endpoint:**
```
POST https://<project-ref>.supabase.co/functions/v1/validate-coupon
```

**Request:**
```json
{
  "code": "WELCOME10",
  "subtotal": 150.00,
  "userId": 123
}
```

**Response (Success):**
```json
{
  "valid": true,
  "couponId": 1,
  "code": "WELCOME10",
  "discountAmount": 15.00,
  "finalTotal": 135.00,
  "message": "تم تطبيق الكوبون بنجاح! وفرت 15.00 جنيه"
}
```

### 2. record-coupon-usage
**Purpose:** تسجيل استخدام الكوبون بعد نجاح الطلب

**Endpoint:**
```
POST https://<project-ref>.supabase.co/functions/v1/record-coupon-usage
```

**Request:**
```json
{
  "couponId": 1,
  "userId": 123,
  "orderId": 456,
  "discountAmount": 15.00
}
```

---

## 📝 Available Coupons (Test Data)

| Code | Type | Value | Min Order | Max Discount | Limit | Per User |
|------|------|-------|-----------|--------------|-------|----------|
| WELCOME10 | percentage | 10% | 100 جنيه | - | unlimited | 1 |
| SAVE50 | fixed | 50 جنيه | 200 جنيه | - | 100 | 1 |
| FIRST15 | percentage | 15% | 150 جنيه | 100 جنيه | 1 | 1 |
| SAVE20 | fixed | 20 جنيه | 100 جنيه | - | unlimited | unlimited |

---

## 🔧 How to Use

### Frontend Integration

#### 1. Validate Coupon (CheckoutPage)
```typescript
const handleApplyCoupon = async () => {
    if (!user) {
        showToast('يجب تسجيل الدخول أولاً', 'warning');
        return;
    }

    try {
        // Option A: Use existing API route
        const result = await api.coupons.validate(couponCode, totalPrice);
        
        // Option B: Use Edge Function (faster)
        const result = await fetch(`${SUPABASE_URL}/functions/v1/validate-coupon`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                code: couponCode,
                subtotal: totalPrice,
                userId: user.id
            })
        }).then(r => r.json());

        if (result.valid) {
            setAppliedCoupon(result);
            setCouponDiscount(result.discountAmount);
            showToast(result.message, 'success');
        }
    } catch (err) {
        showToast('فشل التحقق من الكوبون', 'error');
    }
};
```

#### 2. Record Usage (After Order Success)
```typescript
const handleSubmit = async () => {
    // ... create order ...
    
    if (appliedCoupon && orderResult.id) {
        await api.coupons.recordUsage(
            appliedCoupon.couponId,
            user.id,
            orderResult.id,
            couponDiscount
        );
    }
};
```

---

## 🎨 UI Components

### Coupon Input Box (CheckoutPage)
```tsx
<div className="mb-4">
    <label className="text-sm font-bold mb-2 block">كوبون الخصم</label>
    {!appliedCoupon ? (
        <div className="flex gap-2">
            <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="أدخل كود الكوبون"
                className="flex-1 px-3 py-2 rounded-lg border"
            />
            <button onClick={handleApplyCoupon}>
                تطبيق
            </button>
        </div>
    ) : (
        <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-900 font-bold">{appliedCoupon.code}</p>
            <p className="text-green-700">{appliedCoupon.description}</p>
            <button onClick={handleRemoveCoupon}>إزالة</button>
        </div>
    )}
</div>
```

---

## ✅ Validation Rules

### 1. Code Validation
- كود الكوبون يجب أن يكون موجود في قاعدة البيانات
- `is_active = TRUE`

### 2. Date Validation
- `valid_from`: تاريخ البداية (إذا موجود)
- `valid_until`: تاريخ الانتهاء (إذا موجود)

### 3. Order Value Validation
- `subtotal >= min_order_value`

### 4. Usage Limit Validation
- Total: `used_count < usage_limit` (إذا محدد)
- Per User: `user_usage_count < per_user_limit` (إذا محدد)

### 5. Discount Calculation

#### Percentage Discount:
```javascript
discountAmount = (subtotal * discount_value) / 100
if (max_discount && discountAmount > max_discount) {
    discountAmount = max_discount
}
```

#### Fixed Discount:
```javascript
discountAmount = discount_value
if (discountAmount > subtotal) {
    discountAmount = subtotal
}
```

---

## 🐛 Troubleshooting

### Problem: "كود الكوبون غير صحيح"
**Solution:**
- تأكد أن الكود مكتوب بشكل صحيح (case-insensitive)
- تحقق من `is_active = TRUE`
- تحقق من تواريخ الصلاحية

### Problem: "يجب تسجيل الدخول أولاً"
**Solution:**
- المستخدم يجب أن يكون logged in
- تحقق من وجود token في localStorage

### Problem: "الحد الأدنى للطلب 100 جنيه"
**Solution:**
- زود قيمة الطلب لتصل إلى الحد الأدنى
- أو استخدم كوبون آخر بحد أدنى أقل

### Problem: "لقد استخدمت هذا الكوبون من قبل"
**Solution:**
- هذا الكوبون محدد مرة واحدة لكل مستخدم
- استخدم كوبون آخر

---

## 🔐 Security

### Backend Validation (IMPORTANT)
- ✅ كل الـ validation يتم على الـ backend
- ✅ الـ frontend يرسل فقط الكود والمبلغ
- ✅ الـ server يحسب الخصم ويتحقق من الشروط
- ✅ لا يمكن التلاعب بقيمة الخصم من الـ frontend

### Edge Functions Benefits
- ✅ تشغيل على edge servers (أقرب للمستخدم)
- ✅ أداء أفضل من API routes
- ✅ وصول مباشر للـ database
- ✅ CORS مدعوم
- ✅ scaling تلقائي

---

## 📈 Admin Features

### Create New Coupon
```typescript
await api.coupons.create({
    code: 'NEWYEAR25',
    description: 'خصم 25% للسنة الجديدة',
    discount_type: 'percentage',
    discount_value: 25,
    min_order_value: 200,
    max_discount: 150,
    usage_limit: 500,
    per_user_limit: 1,
    valid_from: '2025-12-31',
    valid_until: '2026-01-07',
    is_active: true
});
```

### View Coupon Analytics
```sql
SELECT 
    c.code,
    c.description,
    c.used_count,
    COUNT(DISTINCT cu.user_id) as unique_users,
    SUM(cu.discount_amount) as total_discount_given
FROM coupons c
LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
WHERE c.id = 1
GROUP BY c.id;
```

---

## 🚀 Deployment

### Deploy Edge Functions
```bash
# Login to Supabase
supabase login

# Link project
supabase link --project-ref <your-ref>

# Deploy functions
supabase functions deploy validate-coupon
supabase functions deploy record-coupon-usage
```

### Apply Database Migrations
```bash
cd server
node apply_coupon_migration.js
```

---

## ✨ Test Cases

### Test 1: Valid Coupon
```bash
curl -X POST 'https://<ref>.supabase.co/functions/v1/validate-coupon' \
  -H 'apikey: <key>' \
  -d '{"code":"WELCOME10","subtotal":150,"userId":8}'
```
**Expected:** ✅ Success with 15 EGP discount

### Test 2: Expired Coupon
**Expected:** ❌ "هذا الكوبون منتهي الصلاحية"

### Test 3: Below Minimum Order
```bash
curl ... -d '{"code":"SAVE50","subtotal":50}'
```
**Expected:** ❌ "الحد الأدنى للطلب 200 جنيه"

### Test 4: Already Used
**Expected:** ❌ "لقد استخدمت هذا الكوبون من قبل"

---

## 📞 Support
For issues or questions, check:
- `server/routes/coupons.js` - API routes
- `supabase/functions/validate-coupon/` - Edge function
- `pages/CheckoutPage.tsx` - Frontend implementation

---

**Last Updated:** December 10, 2025
**Version:** 1.0.0
