# 🚀 إعداد Cloudinary على Vercel

## ⚠️ خطوات مهمة لتشغيل رفع الصور على Vercel

### 1. أضف Environment Variables في Vercel

اذهب إلى:
```
Vercel Dashboard > Your Project > Settings > Environment Variables
```

أضف هذه المتغيرات:

```env
CLOUDINARY_CLOUD_NAME=dwnaacuih
CLOUDINARY_API_KEY=618291128553242
CLOUDINARY_API_SECRET=6EAD1r93PVx9iV8KlL9E2vNH8h4
```

**مهم:** أضفها لكل البيئات (Production, Preview, Development)

### 2. أعد Deploy المشروع

بعد إضافة المتغيرات:
```bash
# من Vercel Dashboard
اضغط "Redeploy" على آخر deployment
```

أو:
```bash
# من Terminal
git add .
git commit -m "Add Cloudinary support"
git push
```

### 3. تحقق من التثبيت

افتح:
```
https://your-project.vercel.app/api/upload/config
```

يجب أن ترى:
```json
{
  "success": true,
  "config": {
    "cloud_name": "dwnaacuih",
    "api_key_set": true,
    "api_secret_set": true
  }
}
```

---

## ✅ الخطوات المكتملة

1. ✅ تم إضافة `cloudinary` إلى `package.json`
2. ✅ تم تثبيت الـ package محلياً
3. ✅ تم إضافة المتغيرات في `.env`
4. ✅ تم إنشاء route `/api/upload`
5. ⏳ يجب إضافة المتغيرات في Vercel

---

## 🧪 الاختبار

### محلياً (localhost):
```bash
# تأكد من تشغيل السيرفر
cd server
npm run dev
```

يجب أن يعمل بدون أخطاء!

### على Vercel:
1. تأكد من إضافة Environment Variables
2. أعد Deploy
3. اختبر رفع صورة من الأدمن

---

## 📝 ملاحظات

- Cloudinary Free Plan يسمح بـ 25GB storage
- يدعم حتى 25,000 تحويلة شهرياً
- الصور تُحفظ تلقائياً في folder `products/`
- الحساب الحالي جاهز ويعمل

---

**التحديث:** 13 ديسمبر 2025
**الحالة:** ✅ جاهز للنشر على Vercel
