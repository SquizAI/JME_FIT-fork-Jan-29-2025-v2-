import { supabase } from '../lib/supabase';
import type { CartItem } from '../types/cart';

export const CartService = {
  async saveAbandonedCart(userId: string | undefined, email: string | undefined, items: CartItem[]) {
    if (!userId && !email) return;

    const { error } = await supabase
      .from('abandoned_carts')
      .insert({
        user_id: userId,
        email,
        items,
        total_amount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async recoverAbandonedCart(userId: string) {
    const { data, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('user_id', userId)
      .eq('recovered', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  },

  async markCartAsRecovered(cartId: string) {
    const { error } = await supabase
      .from('abandoned_carts')
      .update({ 
        recovered: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartId);

    if (error) throw error;
  }
};