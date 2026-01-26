# 🔄 نقل Supabase Database إلى Account جديد

## الخطوات:

### 1️⃣ صدّر البيانات من Supabase القديم

**الطريقة الأسهل - من Dashboard:**

1. افتح [Supabase Dashboard القديم](https://supabase.com/dashboard/project/jsrqjmovbuhuhbmxyqsh)
2. روح **Table Editor** → كل جدول
3. اضغط **Export as CSV** لكل جدول
4. أو استخدم **SQL Editor** وشغّل:

```sql
-- Export all tables data
COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM products) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM categories) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM branches) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM orders) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM order_items) TO STDOUT WITH CSV HEADER;
-- ... إلخ لكل الجداول
```

**الطريقة المتقدمة - pg_dump:**

```bash
# لو عندك PostgreSQL مثبت محلياً
pg_dump -h db.jsrqjmovbuhuhbmxyqsh.supabase.co \
  -U postgres \
  -d postgres \
  --clean \
  --if-exists \
  -f database_backup.sql

# أو export كـ binary
pg_dump -h db.jsrqjmovbuhuhbmxyqsh.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f database_backup.dump
```

🔑 **Database Password:** احصل عليه من:
- Dashboard → Settings → Database → Database Password
- أو Reset password لو ناسيه

---

### 2️⃣ إنشاء Supabase Project جديد

1. افتح [Supabase](https://supabase.com/dashboard)
2. اعمل **New Project**:
   - **Name:** Allosh Market (أو أي اسم)
   - **Database Password:** احفظه كويس!
   - **Region:** اختار أقرب منطقة (مثلاً Mumbai/Singapore لمصر)
3. استنى 2-3 دقايق لحد ما البروجيكت يجهز

---

### 3️⃣ استورد البيانات في Project الجديد

**من Dashboard:**

1. روح **SQL Editor** في البروجيكت الجديد
2. الصق الـ SQL backup file
3. اضغط **Run**

**أو استخدم psql:**

```bash
# Restore من SQL file
psql -h db.[NEW_PROJECT_ID].supabase.co \
  -U postgres \
  -d postgres \
  -f database_backup.sql

# أو من dump file
pg_restore -h db.[NEW_PROJECT_ID].supabase.co \
  -U postgres \
  -d postgres \
  database_backup.dump
```

---

### 4️⃣ احصل على Credentials الجديدة

من Dashboard → Settings → API:

- **Project URL:** `https://[NEW_PROJECT_ID].supabase.co`
- **anon public key:** `eyJhb...`
- **service_role key:** `eyJhb...` (للـ Backend)

---

### 5️⃣ حدّث المشروع بالـ Credentials الجديدة

سأقوم بتحديث الملفات تلقائياً بعد ما تديني:
- ✅ Project URL الجديد
- ✅ Anon Key الجديد  
- ✅ Service Role Key الجديد

الملفات اللي هتتعدل:
- `.env` (Frontend)
- `backend/.env` (Backend)
- `vercel.json` environment variables (لو موجودة)

---

## 🎯 ملخص الخطوات:

```
1. Export data من القديم (CSV أو SQL)
   ↓
2. إنشاء Supabase project جديد
   ↓
3. Import البيانات في الجديد
   ↓
4. نسخ الـ credentials الجديدة
   ↓
5. تحديث .env files
   ↓
6. Deploy 🚀
```

---

## ⚠️ ملاحظات مهمة:

1. **Storage Files:** لو عندك صور في Supabase Storage، لازم تنسخها يدوياً
2. **Auth Users:** لازم تنسخ جدول `auth.users` بحذر
3. **RLS Policies:** لازم تطبق نفس الـ Row Level Security policies
4. **Functions:** لازم تنسخ الـ Edge Functions لو موجودة

---

## 🆘 محتاج مساعدة؟

لو مش عارف تعمل Export/Import، قولي وهساعدك خطوة بخطوة!

أو لو حبيت **أعملك script يعمل كل حاجة automatic**، بس هحتاج:
- Database password القديم (لو متاح)
- Credentials الجديدة بعد ما تعمل البروجيكت
