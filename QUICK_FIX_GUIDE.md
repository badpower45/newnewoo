# 🔧 Quick Fix Guide - إصلاح مشاكل الـ API URLs

## المشكلة
تظهر أخطاء 404 من `bkaa.vercel.app` في Console

## السبب
Old cached build من Vercel بيستخدم API URLs قديمة

## ✅ الحل السريع (للمستخدمين)

### الخطوة 1: امسح الـ Cache
```
1. اضغط Ctrl + Shift + Delete (Windows) أو Cmd + Shift + Delete (Mac)
2. اختر "Cached images and files"
3. اضغط Clear data
```

### الخطوة 2: Hard Refresh
```
اضغط Ctrl + Shift + R (Windows) أو Cmd + Shift + R (Mac)
```

### الخطوة 3: إذا لم يعمل
افتح Console (F12) واكتب:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

---

## 🛠️ للمطورين - Developer Guide

### Build النظيف
```bash
# Windows PowerShell
.\clean-build.ps1

# Linux/Mac
chmod +x clean-build.sh
./clean-build.sh
```

### Check الـ Config
افتح Console وشوف الرسائل:
```
📋 Config Loaded: {
    API_URL: "https://newnewoo-server.vercel.app/api",
    SOCKET_URL: "https://newnewoo-server.vercel.app",
    timestamp: "..."
}
```

### الـ URLs الصحيحة
```
✅ API:    https://newnewoo-server.vercel.app/api
✅ Socket: https://newnewoo-server.vercel.app
❌ OLD:    https://bkaa.vercel.app (لا تستخدم هذا)
```

---

## 📦 Vercel Deployment

### Environment Variables
تأكد من إضافة المتغيرات دي في Vercel Dashboard:
```
VITE_API_URL=https://newnewoo-server.vercel.app/api
VITE_SOCKET_URL=https://newnewoo-server.vercel.app
```

### Force New Deploy
```bash
git add .
git commit -m "fix: Force new build with correct API URLs"
git push
```

انتظر 2-3 دقائق للـ build الجديد

---

## 🔍 Troubleshooting

### Problem: لسه بيظهر bkaa.vercel.app
**Solution:**
1. امسح browser cache تماماً
2. اعمل hard refresh
3. جرب في Incognito/Private mode
4. جرب من browser تاني

### Problem: Socket errors
**Solution:**
Socket URL يجب يكون `https://newnewoo-server.vercel.app` (بدون `/api`)

### Problem: 401 Unauthorized
**Solution:**
```javascript
// امسح الـ token وسجل دخول مرة تانية
localStorage.removeItem('token');
location.href = '/login';
```

---

## 📊 Version Info

- **Current Version:** 2.0.1
- **API URL:** https://newnewoo-server.vercel.app/api
- **Last Updated:** 2025-12-10

---

## 🚨 Important Notes

1. **Cache is King:** معظم المشاكل سببها الـ browser cache
2. **Hard Refresh:** دايماً اعمل hard refresh بعد الـ deploy
3. **Console Logs:** الـ config بيطبع نفسه في console للـ debugging
4. **Production Mode:** Build دايماً بـ production mode: `npm run build`

---

## 📞 Need Help?

إذا المشكلة لسه موجودة:
1. افتح Console (F12)
2. اعمل screenshot للـ errors
3. شوف الـ Network tab → اي request فيه bkaa.vercel.app
4. تواصل مع الـ dev team
