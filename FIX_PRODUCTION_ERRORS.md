# 🔧 Fix Production Errors Guide

## المشاكل المكتشفة وحلولها

---

## 1. 🔴 Supabase 401 Unauthorized (Chat)

### المشكلة:
```
jsrqjmovbuhuhbmxyqsh.supabase.co/rest/v1/conversations - 401 Unauthorized
```

### الحل:
يجب تشغيل هذا الـ SQL في Supabase SQL Editor:

```sql
-- =============================================
-- Chat System Complete Setup
-- =============================================

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    customer_name VARCHAR(255) NOT NULL DEFAULT 'زائر',
    agent_id INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('customer', 'agent', 'bot')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON conversations TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE conversations_id_seq TO anon, authenticated;

-- Create policies (allow public access for chat)
DROP POLICY IF EXISTS "Allow read messages" ON messages;
DROP POLICY IF EXISTS "Allow insert messages" ON messages;
DROP POLICY IF EXISTS "Allow update messages" ON messages;
DROP POLICY IF EXISTS "Allow read conversations" ON conversations;
DROP POLICY IF EXISTS "Allow insert conversations" ON conversations;
DROP POLICY IF EXISTS "Allow update conversations" ON conversations;

CREATE POLICY "Allow read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update messages" ON messages FOR UPDATE USING (true);
CREATE POLICY "Allow read conversations" ON conversations FOR SELECT USING (true);
CREATE POLICY "Allow insert conversations" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update conversations" ON conversations FOR UPDATE USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
```

---

## 2. 🔴 Socket.io 404 Error

### المشكلة:
```
bkaa.vercel.app/socket.io/ - 404 Not Found
```

### السبب:
Vercel لا يدعم WebSocket servers. Socket.io يحتاج إلى سيرفر دائم.

### الحل:
✅ تم إصلاحه تلقائياً! الكود الآن:
- يحاول الاتصال 3 مرات فقط
- إذا فشل، يتوقف ويستخدم Supabase Realtime بدلاً منه
- لا يظهر أخطاء مزعجة في الكونسول

---

## 3. 🔴 Cart API 500 Error

### المشكلة:
```
bkaa.vercel.app/api/cart?userId=1&branchId=1 - 500 Internal Server Error
```

### الأسباب المحتملة:

#### أ) Database Connection Error
تأكد من وجود هذه المتغيرات في Vercel Environment Variables:

```env
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres

# أو استخدم المتغيرات المنفصلة:
DB_HOST=aws-0-region.pooler.supabase.com
DB_USER=postgres.your-project-ref
DB_PORT=6543
DB_PASSWORD=your-password
DB_NAME=postgres
DB_SSL=true
```

⚠️ **مهم جداً**: استخدم Port `6543` (Transaction Mode) وليس `5432`!

#### ب) Cart Table Not Exists
تأكد من وجود جدول cart في قاعدة البيانات:

```sql
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    substitution_preference VARCHAR(50) DEFAULT 'none',
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. 🔴 Orders API 500 Error

### المشكلة:
```
bkaa.vercel.app/api/orders - 500 Internal Server Error
```

### الحل:
نفس حل Cart API - تأكد من:
1. Environment variables صحيحة
2. جدول orders موجود
3. Port 6543 للـ Supabase

---

## 5. 🔴 Bulk Import 500 Error

### المشكلة:
```
bkaa.vercel.app/api/products/bulk-import - 500 Internal Server Error
```

### الحل:
تأكد من وجود ملف `bulkImport.js` في routes وأن الـ database connection يعمل.

---

## 📋 خطوات الإصلاح الكاملة:

### الخطوة 1: تحديث Vercel Environment Variables
اذهب إلى Vercel Dashboard → Settings → Environment Variables وأضف:

```
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres
JWT_SECRET=your-64-character-secret
```

### الخطوة 2: تشغيل SQL في Supabase
1. اذهب إلى Supabase Dashboard
2. اختر SQL Editor
3. انسخ والصق محتوى ملف `supabase/migrations/chat_realtime_setup.sql`
4. اضغط Run

### الخطوة 3: إعادة النشر
```bash
# في مجلد المشروع
vercel --prod
```

### الخطوة 4: التحقق
افتح الموقع واختبر:
- ✅ الشات يعمل
- ✅ السلة تعمل
- ✅ الطلبات تعمل

---

## 🔍 للتشخيص:

### فحص Vercel Logs:
```bash
vercel logs --prod
```

### فحص Database Connection:
```bash
# في مجلد server
node -e "require('./database.js')"
```

---

## ⚡ ملاحظات مهمة:

1. **Socket.io**: لن يعمل على Vercel. استخدم Supabase Realtime للـ chat.
2. **Database Port**: استخدم `6543` وليس `5432` لتجنب MaxClients error.
3. **SSL**: يجب أن يكون مفعّل (`DB_SSL=true`) مع Supabase.
