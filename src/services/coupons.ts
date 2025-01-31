import { supabase } from '../lib/supabase';

export const CouponService = {
  async validateCoupon(code: string, items: any[]) {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) throw error;

    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw new Error('Coupon has expired');
    }

    if (coupon.max_uses && coupon.uses >= coupon.max_uses) {
      throw new Error('Coupon usage limit reached');
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (coupon.min_purchase_amount && subtotal < coupon.min_purchase_amount) {
      throw new Error(`Minimum purchase amount of $${coupon.min_purchase_amount} required`);
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = subtotal * (coupon.value / 100);
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.value;
    }

    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.round(discount * 100) / 100
    };
  },

  async incrementCouponUses(couponId: string) {
    const { error } = await supabase
      .from('coupons')
      .update({ 
        uses: supabase.sql`uses + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', couponId);

    if (error) throw error;
  }
};