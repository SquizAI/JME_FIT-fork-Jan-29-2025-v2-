import { supabase } from '../lib/supabase';

export const WishlistService = {
  async createWishlist(userId: string, name: string, isPublic = false) {
    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        name,
        is_public: isPublic
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getWishlists(userId: string) {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        wishlist_items (
          product:product_id (
            *,
            product_variants (*)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addToWishlist(wishlistId: string, productId: string, variantId?: string) {
    const { error } = await supabase
      .from('wishlist_items')
      .insert({
        wishlist_id: wishlistId,
        product_id: productId,
        variant_id: variantId
      });

    if (error) throw error;
  },

  async removeFromWishlist(wishlistId: string, productId: string, variantId?: string) {
    const query = supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlistId)
      .eq('product_id', productId);

    if (variantId) {
      query.eq('variant_id', variantId);
    }

    const { error } = await query;
    if (error) throw error;
  }
};