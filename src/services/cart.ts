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
  },

  getActiveSession: async (userId: string) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .single();

    if (error) throw error;
    return data;
  },

  getCart: async (userId: string) => {
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .single();

    if (error) throw error;
    return data;
  },

  syncCart: async (userId: string, items: CartItem[]) => {
    // Implement the logic to sync the cart with the backend
    const { error } = await supabase
      .from('carts')
      .update({ items })
      .eq('user_id', userId)
      .eq('active', true);

    if (error) throw error;
  },

  createSession: async (userId: string) => {
    // Implement the logic to create a session for a user
    const { data, error } = await supabase
      .from('sessions')
      .insert({ user_id: userId, active: true })
      .single();

    if (error) throw error;
    return data;
  },

  createCart: async (userId: string) => {
    // Implement the logic to create a cart for a user
    const { data, error } = await supabase
      .from('carts')
      .insert({ user_id: userId, active: true, items: [] }) // Assuming a new cart starts empty
      .single();

    if (error) throw error;
    return data;
  },

  getCartItems: async (cartId: string) => {
    // Implement the logic to retrieve items for a specific cart
    const { data, error } = await supabase
      .from('cart_items') // Assuming you have a 'cart_items' table
      .select('*')
      .eq('cart_id', cartId);

    if (error) throw error;
    return data;
  },

  // Add other functions as needed
};