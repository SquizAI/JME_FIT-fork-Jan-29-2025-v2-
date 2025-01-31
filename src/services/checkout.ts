import { supabase } from '../lib/supabase';
import { StripeService } from './stripe';
import type { CartItem } from '../types/cart';
import type { ShippingAddress } from '../types/checkout';

export interface CheckoutData {
  items: CartItem[];
  email: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  sameAsShipping: boolean;
  userId?: string;
  saveInfo?: boolean;
  metadata?: Record<string, any>;
}

export const CheckoutService = {
  async createOrder(data: CheckoutData) {
    try {
      // Create order in database
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: data.userId,
          email: data.email,
          shipping_address: data.shippingAddress,
          billing_address: data.sameAsShipping ? data.shippingAddress : data.billingAddress,
          status: 'pending',
          total_amount: data.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          metadata: data.metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Create order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          data.items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
            metadata: {
              size: item.size,
              color: item.color
            }
          }))
        );

      if (itemsError) throw itemsError;

      // Save customer info if requested
      if (data.saveInfo && data.userId) {
        await this.saveCustomerInfo(data.email, data.shippingAddress, data.userId);
      }

      return order;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  },

  async saveCustomerInfo(email: string, address: ShippingAddress, userId: string) {
    const { error } = await supabase
      .from('customer_info')
      .insert({
        user_id: userId,
        email,
        shipping_address: address,
        last_used: new Date().toISOString()
      });

    if (error) throw error;
  },

  async getCustomerInfo(userId: string) {
    const { data, error } = await supabase
      .from('customer_info')
      .select('*')
      .eq('user_id', userId)
      .order('last_used', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async validateCoupon(code: string) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) throw error;
    
    if (!data) {
      throw new Error('Invalid coupon code');
    }

    if (new Date(data.expires_at) < new Date()) {
      throw new Error('Coupon has expired');
    }

    if (data.uses >= data.max_uses) {
      throw new Error('Coupon usage limit reached');
    }

    return data;
  },

  async createCheckoutSession(data: CheckoutData) {
    try {
      // Create order first
      const order = await this.createOrder(data);

      // Create Stripe checkout session
      const session = await StripeService.createCheckoutSession({
        items: data.items,
        userId: data.userId,
        shippingAddress: data.shippingAddress,
        billingAddress: data.sameAsShipping ? data.shippingAddress : data.billingAddress,
        savePaymentMethod: data.saveInfo,
        metadata: {
          orderId: order.id,
          userId: data.userId
        }
      });

      return session;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      throw err;
    }
  }
};