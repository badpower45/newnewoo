import { query } from './database.js';

async function resetCouponUsage() {
    try {
        console.log('🧹 Cleaning up test coupon usage records...\n');
        
        // Delete test usage records (where order_id is null)
        const deleteResult = await query(
            'DELETE FROM coupon_usage WHERE order_id IS NULL RETURNING *'
        );
        
        console.log(`✅ Deleted ${deleteResult.rows.length} test records:`);
        console.table(deleteResult.rows);
        
        // Reset used_count for all coupons
        await query('UPDATE coupons SET used_count = 0 WHERE used_count > 0');
        console.log('\n✅ Reset used_count to 0 for all coupons');
        
        // Show current coupon status
        const coupons = await query('SELECT code, used_count, usage_limit, per_user_limit FROM coupons');
        console.log('\n📊 Current Coupon Status:');
        console.table(coupons.rows);
        
        console.log('\n🎉 Coupon system reset complete! You can now test all coupons again.');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

resetCouponUsage();
