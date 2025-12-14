# 🚨 CIRCUIT BREAKER FIX - خطوات عاجلة

## المشكلة
```
Circuit breaker open: Unable to establish connection to upstream database
```

## الحل السريع - اعمل دلوقتي!

### 1️⃣ روح Vercel Dashboard
```
https://vercel.com/dashboard → Your Project → Settings → Environment Variables
```

### 2️⃣ غيّر DATABASE_URL

**اعمل Replace للقيمة دي:**

#### القديمة (لو موجودة):
```
postgresql://postgres.jsrqjmovbuhuhbmxyqsh:13572468bodeAa@aws-1-eu-west-3.pooler.supabase.com:5432/postgres
```

#### الجديدة (الصحيحة):
```
postgresql://postgres.jsrqjmovbuhuhbmxyqsh:13572468bodeAa@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?sslmode=no-verify&pgbouncer=true
```

**التغييرات:**
- ✅ Port: `5432` → `6543`
- ✅ أضف: `?sslmode=no-verify&pgbouncer=true`

### 3️⃣ احفظ و Redeploy

1. **Save** environment variable
2. اذهب لـ **Deployments**
3. اختر آخر deployment
4. **Redeploy**

---

## ما تم تحديثه في الكود:

### ✅ Connection Timeouts
- `connectionTimeoutMillis: 10000` (10 seconds)
- `idleTimeoutMillis: 20000` (20 seconds)

### ✅ Enhanced Retry Logic
- 3 محاولات بدلاً من 2
- Exponential backoff (1s, 2s, 4s)
- Auto pool reset بين المحاولات

### ✅ PgBouncer Support
- Auto-add `pgbouncer=true` للـ port 6543
- Better connection pooling

### ✅ Circuit Breaker Handling
- Catch error code `XX000`
- Retry on "upstream database" errors

---

## 🧪 بعد Redeploy - اختبار

### Test في Browser:
```
https://your-backend.vercel.app/api/products
https://your-backend.vercel.app/api/branches
https://your-backend.vercel.app/health
```

### Expected Result:
- ✅ Status 200
- ✅ JSON data بدون errors
- ✅ No circuit breaker في الـ logs

---

## إذا لسه في مشكلة:

### Option A: استخدم Direct Connection (مؤقت)
في Vercel Environment Variables، جرب:
```
DATABASE_URL=postgresql://postgres:13572468bodeAa@db.jsrqjmovbuhuhbmxyqsh.supabase.co:5432/postgres?sslmode=no-verify
```

### Option B: تحقق من Supabase Status
1. افتح Supabase Dashboard
2. Project Settings → Database
3. تأكد Connection Pooler **Enabled**
4. لو مش enabled، فعّله

### Option C: Restart Supabase Pooler
```
Supabase Dashboard → Settings → Database → Restart Connection Pooler
```

---

## 📊 Monitoring

### راقب Vercel Logs:
```
✅ SUCCESS:
- "Database connected successfully"
- "GET /api/products - 200"

❌ FAILURE:
- "Circuit breaker open"
- "Connection terminated"
```

### راقب Supabase Dashboard:
```
Database → Connection Pooling → Active Connections
Should be: < 60 connections
```

---

## الخلاصة

**الخطوة الأهم:** غيّر `DATABASE_URL` في Vercel وأضف:
```
?sslmode=no-verify&pgbouncer=true
```

**بعدها Redeploy وخلاص!** 🚀
