// Supabase Edge Function: record-coupon-usage
// Records coupon usage after successful order completion
// Increments usage counters and creates usage records

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CouponUsageRequest {
  couponId: number
  userId: number
  orderId: number
  discountAmount: number
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { couponId, userId, orderId, discountAmount }: CouponUsageRequest = await req.json()

    if (!couponId || !userId) {
      return new Response(
        JSON.stringify({ 
          error: 'معرف الكوبون والمستخدم مطلوبان',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Start a transaction-like approach
    // 1. Record coupon usage
    const { error: usageError } = await supabase
      .from('coupon_usage')
      .insert({
        coupon_id: couponId,
        user_id: userId,
        order_id: orderId || null,
        discount_amount: discountAmount,
        used_at: new Date().toISOString()
      })

    if (usageError) {
      console.error('Error recording coupon usage:', usageError)
      return new Response(
        JSON.stringify({ 
          error: 'فشل تسجيل استخدام الكوبون',
          details: usageError.message || usageError,
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 2. Increment used_count in coupons table
    // First get current count
    const { data: couponData } = await supabase
      .from('coupons')
      .select('used_count')
      .eq('id', couponId)
      .single()

    if (couponData) {
      const newCount = (couponData.used_count || 0) + 1
      const { error: updateError } = await supabase
        .from('coupons')
        .update({ 
          used_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', couponId)

      if (updateError) {
        console.error('Error incrementing coupon counter:', updateError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم تسجيل استخدام الكوبون بنجاح'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in record-coupon-usage:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ أثناء تسجيل استخدام الكوبون',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
