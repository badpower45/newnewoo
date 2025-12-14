# 🔧 حل مشكلة Database Connection في Vercel

## المشكلة
```
Error: Connection terminated unexpectedly
Connection attempt 2/3 failed: Connection terminated unexpectedly
```

## السبب الرئيسي
Vercel Serverless Functions تعمل بنظام **cold starts** وتحتاج إعدادات database pool خاصة جداً:
- ✅ **max: 1** - اتصال واحد فقط لكل serverless function
- ✅ **allowExitOnIdle: true** - السماح بإغلاق الـ pool عند عدم الاستخدام
- ✅ **idleTimeoutMillis: 10000** - إغلاق الاتصالات الخاملة بسرعة (10 ثواني)
- ✅ **Retry Logic** - إعادة المحاولة تلقائياً عند فشل الاتصال

## التعديلات المطبقة

### 1️⃣ تحديث Database Pool Configuration
**الملف:** `server/api/index.js`

```javascript
const pool = new Pool({
    connectionString: normalizeConnectionString(process.env.DATABASE_URL),
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    max: 1, // ⚠️ CRITICAL: Only 1 connection per serverless instance
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true, // Allow graceful shutdown
});

// Handle pool errors without crashing
pool.on('error', (err, client) => {
    console.error('❌ Unexpected pool error:', err.message);
});
```

### 2️⃣ إضافة Retry Logic للـ Queries
```javascript
const query = async (text, params, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const result = await pool.query(text, params);
            return result;
        } catch (err) {
            // Retry on connection errors
            if (
                (err.code === 'ECONNRESET' || 
                 err.code === 'ETIMEDOUT' || 
                 err.message.includes('Connection terminated') ||
                 err.message.includes('connection timeout')) &&
                attempt < retries
            ) {
                console.log(`🔄 Retry ${attempt + 1}/${retries}`);
                await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
                continue;
            }
            throw err;
        }
    }
};
```

### 3️⃣ تحديث Vercel Configuration
**الملف:** `vercel.backend.json`

```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

## خطوات النشر

### 1. Push التعديلات
```bash
cd server
git add .
git commit -m "Fix database connection pool for Vercel serverless"
git push
```

### 2. تحقق من Environment Variables في Vercel
تأكد أن المتغيرات التالية موجودة:
- ✅ `DATABASE_URL` - رابط الاتصال بـ Supabase
- ✅ `JWT_SECRET` - مفتاح التشفير
- ✅ `NODE_ENV=production`

### 3. Redeploy
```bash
vercel --prod
```

## التحقق من الحل

### اختبر الـ API:
```bash
# Test products endpoint
curl https://your-backend.vercel.app/api/products

# Check health
curl https://your-backend.vercel.app/health
```

### راقب الـ Logs في Vercel:
```
✅ Database connected successfully
✅ GET /api/products - 200
```

## معلومات إضافية

### لماذا max: 1؟
- كل serverless function instance منفصلة
- Supabase Pooler يدير الاتصالات الفعلية
- وجود أكثر من connection يسبب Connection Pool Exhaustion

### لماذا allowExitOnIdle: true؟
- يسمح بإغلاق الـ pool عند انتهاء الـ request
- يمنع تسريب Connections
- يتناسب مع Serverless Architecture

### البدائل (إذا استمرت المشكلة):

#### خيار 1: استخدام Supabase Connection Pooler
```javascript
// Use :6543 port instead of :5432
DATABASE_URL=postgresql://user:pass@host:6543/dbname?pgbouncer=true
```

#### خيار 2: استخدام HTTP Client بدلاً من pg Pool
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)
```

#### خيار 3: Upgrade Supabase Plan
- Free tier: 60 connections
- Pro tier: 200 connections

## الخلاصة

✅ تم تحديث Database Pool settings للـ serverless
✅ تم إضافة automatic retry logic
✅ تم تحسين Vercel configuration
✅ تم إضافة error handling محسّن

**النتيجة المتوقعة:** اختفاء أخطاء "Connection terminated unexpectedly"
