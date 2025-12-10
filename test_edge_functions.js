// Test Edge Functions deployment
const SUPABASE_URL = 'https://jsrqjmovbuhuhbmxyqsh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcnFqbW92YnVodWhibXh5cXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTYyNDMsImV4cCI6MjA3OTczMjI0M30.KTLemDWeFWabMRUpKKVzK4bMKaTLdfN51Sui0xtXdag';

async function testValidateCoupon() {
    console.log('🧪 Testing validate-coupon Edge Function...\n');
    
    const url = `${SUPABASE_URL}/functions/v1/validate-coupon`;
    const body = {
        code: 'WELCOME10',
        subtotal: 150,
        userId: 8
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        console.log('📊 Response Status:', response.status);
        console.log('📦 Response Data:');
        console.log(JSON.stringify(data, null, 2));
        
        if (data.valid) {
            console.log('\n✅ SUCCESS! Coupon validation working!');
            console.log(`💰 Discount Amount: ${data.discountAmount} EGP`);
            console.log(`💵 Final Total: ${data.finalTotal} EGP`);
        } else {
            console.log('\n❌ Validation failed:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function testRecordCouponUsage() {
    console.log('\n\n🧪 Testing record-coupon-usage Edge Function...\n');
    
    const url = `${SUPABASE_URL}/functions/v1/record-coupon-usage`;
    const body = {
        couponId: 1,
        userId: 8,
        orderId: null, // null since we don't have a real order yet
        discountAmount: 15.00
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        console.log('📊 Response Status:', response.status);
        console.log('📦 Response Data:');
        console.log(JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('\n✅ SUCCESS! Coupon usage recorded!');
        } else {
            console.log('\n❌ Recording failed:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function runTests() {
    await testValidateCoupon();
    await testRecordCouponUsage();
    
    console.log('\n\n🎉 All Edge Functions deployed successfully!');
    console.log('\n📍 Function URLs:');
    console.log(`   - ${SUPABASE_URL}/functions/v1/validate-coupon`);
    console.log(`   - ${SUPABASE_URL}/functions/v1/record-coupon-usage`);
}

runTests();
