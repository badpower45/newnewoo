# Validate Coupon Edge Function

## Description
This Supabase Edge Function validates discount coupons for orders. It checks coupon validity, usage limits, user limits, and calculates the final discount amount.

## Features
- ✅ Validates coupon code and expiration dates
- ✅ Checks minimum order value requirements
- ✅ Enforces usage limits (total and per-user)
- ✅ Calculates discount (percentage or fixed)
- ✅ Applies maximum discount caps
- ✅ CORS support for frontend integration
- ✅ Error handling with Arabic messages

## Deployment

### Prerequisites
1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref <your-project-ref>
```

### Deploy the function:
```bash
supabase functions deploy validate-coupon
```

### Set environment variables (already configured in your project):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Usage

### API Endpoint
```
POST https://<project-ref>.supabase.co/functions/v1/validate-coupon
```

### Request Body
```json
{
  "code": "WELCOME10",
  "subtotal": 150.00,
  "userId": 123
}
```

### Response (Success)
```json
{
  "valid": true,
  "couponId": 1,
  "code": "WELCOME10",
  "description": "خصم 10% للعملاء الجدد",
  "discountType": "percentage",
  "discountValue": 10,
  "discountAmount": 15.00,
  "finalTotal": 135.00,
  "message": "تم تطبيق الكوبون بنجاح! وفرت 15.00 جنيه"
}
```

### Response (Error)
```json
{
  "valid": false,
  "error": "كود الكوبون غير صحيح أو منتهي الصلاحية"
}
```

## Error Messages (Arabic)
- `كود الكوبون والمبلغ الإجمالي مطلوبان` - Code and subtotal required
- `كود الكوبون غير صحيح أو منتهي الصلاحية` - Invalid or expired coupon
- `هذا الكوبون غير صالح للاستخدام بعد` - Coupon not yet valid
- `هذا الكوبون منتهي الصلاحية` - Coupon expired
- `الحد الأدنى للطلب X جنيه لاستخدام هذا الكوبون` - Minimum order not met
- `عذراً، تم استنفاد جميع استخدامات هذا الكوبون` - Usage limit reached
- `لقد استخدمت هذا الكوبون من قبل` - User already used this coupon

## Integration with Frontend

Update `services/api.ts` to use the edge function (optional):
```typescript
coupons: {
    validate: async (code: string, subtotal: number) => {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/validate-coupon`, {
            method: 'POST',
            headers: {
                ...getHeaders(),
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ code, subtotal })
        });
        return res.json();
    }
}
```

## Testing

Test with curl:
```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/validate-coupon' \
  -H 'apikey: <your-anon-key>' \
  -H 'Content-Type: application/json' \
  -d '{"code":"WELCOME10","subtotal":150,"userId":8}'
```

## Performance Benefits
- ✅ Runs at the edge (lower latency)
- ✅ Direct database access (faster than API route)
- ✅ No Express.js overhead
- ✅ Automatic scaling
- ✅ Built-in caching support

## Database Requirements
Requires the following tables:
- `coupons` - Stores coupon definitions
- `coupon_usage` - Tracks coupon usage per user

See `server/migrations/` for schema.
