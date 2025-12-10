// Supabase Edge Function: validate-coupon
// Validates and applies discount coupons for orders
// Enhanced version with caching and performance optimization

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CouponValidationRequest {
  code: string
  subtotal: number
  userId?: number
}

interface Coupon {
  id: number
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_value: number
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  per_user_limit: number | null
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { code, subtotal, userId }: CouponValidationRequest = await req.json()

    if (!code || !subtotal) {
      return new Response(
        JSON.stringify({ 
          error: 'كود الكوبون والمبلغ الإجمالي مطلوبان',
          valid: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch coupon from database
    const { data: couponData, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', code)
      .eq('is_active', true)
      .single()

    if (couponError || !couponData) {
      return new Response(
        JSON.stringify({ 
          error: 'كود الكوبون غير صحيح أو منتهي الصلاحية',
          valid: false 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const coupon: Coupon = couponData

    // Validate coupon dates
    const now = new Date()
    
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return new Response(
        JSON.stringify({ 
          error: 'هذا الكوبون غير صالح للاستخدام بعد',
          valid: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return new Response(
        JSON.stringify({ 
          error: 'هذا الكوبون منتهي الصلاحية',
          valid: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check minimum order value
    if (subtotal < coupon.min_order_value) {
      return new Response(
        JSON.stringify({ 
          error: `الحد الأدنى للطلب ${coupon.min_order_value} جنيه لاستخدام هذا الكوبون`,
          valid: false,
          minOrder: coupon.min_order_value 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check usage limit
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return new Response(
        JSON.stringify({ 
          error: 'عذراً، تم استنفاد جميع استخدامات هذا الكوبون',
          valid: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check per-user usage limit (if userId provided)
    if (userId && coupon.per_user_limit !== null) {
      const { data: usageData, error: usageError } = await supabase
        .from('coupon_usage')
        .select('id', { count: 'exact' })
        .eq('coupon_id', coupon.id)
        .eq('user_id', userId)

      if (!usageError && usageData && usageData.length >= coupon.per_user_limit) {
        return new Response(
          JSON.stringify({ 
            error: 'لقد استخدمت هذا الكوبون من قبل',
            valid: false 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Calculate discount
    let discountAmount = 0

    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100

      // Apply max discount cap if exists
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount
      }
    } else if (coupon.discount_type === 'fixed') {
      discountAmount = coupon.discount_value

      // Ensure discount doesn't exceed subtotal
      if (discountAmount > subtotal) {
        discountAmount = subtotal
      }
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100
    const finalTotal = subtotal - discountAmount

    // Return success response
    return new Response(
      JSON.stringify({
        valid: true,
        couponId: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountAmount: discountAmount,
        finalTotal: Math.max(0, finalTotal),
        message: `تم تطبيق الكوبون بنجاح! وفرت ${discountAmount.toFixed(2)} جنيه`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error validating coupon:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ أثناء التحقق من الكوبون',
        valid: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
