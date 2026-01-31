# CORS Fix للـ Backend

## المشكلة
```
Access to fetch at 'https://bodeelezaby-backend-test.hf.space/api/...' from origin 'https://newnewoo.vercel.app' 
has been blocked by CORS policy
```

## الحل المطبق

### 1. تحديث `server/index.js`
تم إضافة:
- ✅ Headers صريحة لـ CORS: `methods`, `allowedHeaders`, `exposedHeaders`, `maxAge`
- ✅ معالج خاص لـ OPTIONS requests: `app.options('*', cors())`
- ✅ Middleware احتياطي يضيف headers لكل response

### 2. تحديث `vercel.backend.json`
تم إضافة CORS headers في routes configuration:
```json
"headers": {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400"
}
```

## خطوات إعادة Deploy

### للـ Backend (bodeelezaby-backend-test.hf.space):
```bash
cd server
vercel --prod
```

أو من الجذر مع التحديد:
```bash
vercel --prod --cwd server
```

### تأكد من:
1. ✅ الـ Backend deployed على `bodeelezaby-backend-test.hf.space`
2. ✅ الـ Frontend deployed على `newnewoo.vercel.app`
3. ✅ Environment variables صحيحة في Vercel

## اختبار CORS

### في Console:
```javascript
fetch('https://bodeelezaby-backend-test.hf.space/api/health', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://newnewoo.vercel.app'
  }
}).then(r => console.log(r.headers))
```

يجب أن ترى:
- `access-control-allow-origin: *` أو `https://newnewoo.vercel.app`
- `access-control-allow-methods: GET, POST, PUT, DELETE...`
- Status: 200 أو 204

## ملاحظات

### Origins المسموح بها:
```javascript
- http://localhost:5173
- http://localhost:5174
- http://localhost:5175
- https://newnewoo.vercel.app
- https://newnewoo-*.vercel.app (كل preview deployments)
- أي domain ينتهي بـ .vercel.app
```

### في حالة استمرار المشكلة:
1. تحقق من Environment Variables في Vercel Dashboard
2. تأكد من `FRONTEND_URL` محدد في Backend
3. راجع Vercel logs: `vercel logs [deployment-url]`
4. جرب redeploy للـ Backend

## تغييرات الملفات

### Modified:
- ✅ `server/index.js` - CORS middleware محسّن
- ✅ `vercel.backend.json` - CORS headers في routes

---

**الآن يجب أن يعمل CORS بشكل صحيح! 🎉**
