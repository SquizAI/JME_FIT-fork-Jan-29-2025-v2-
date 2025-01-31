import { supabase } from '../lib/supabase';
import type { 
  Membership, 
  Program, 
  Product, 
  ProductCategory,
  MembershipInterval 
} from '../types/products';

export const ProductService = {
  // Memberships
  async getMemberships() {
    const { data: memberships, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('status', 'active')
      .order('price_monthly', { ascending: true });

    if (error) throw error;
    return memberships;
  },

  async getMembershipBySlug(slug: string) {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  // Programs
  async getPrograms() {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('status', 'active')
      .order('price', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getProgramBySlug(slug: string) {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async getProgramById(programId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', programId)
      .single();

    if (error) throw error;
    return data;
  },

  // Products
  async getProducts(categorySlug?: string) {
    let query = supabase
      .from('products') 
      .select('*')
      .eq('status', 'active');

    if (categorySlug) {
      query = query.eq('metadata->category', categorySlug);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async checkInventory(productId: string, variantId?: string): Promise<boolean> {
    const { data: product, error } = await supabase
      .from(variantId ? 'product_variants' : 'products')
      .select('inventory_count')
      .eq('id', variantId || productId)
      .single(); 

    if (error) throw error;
    return product.inventory_count > 0;
  },

  async joinWaitlist(productId: string, userId: string, variantId?: string) {
    const { error } = await supabase
      .from('product_waitlist')
      .insert({
        product_id: productId,
        user_id: userId,
        variant_id: variantId,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async getProductBySlug(slug: string) {
    if (!slug) {
      throw new Error('Product slug is required');
    }

    // Try to parse as UUID first
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .or(isUuid ? `id.eq.${slug}` : `slug.eq.${slug}`)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch product');
    }

    if (!products) {
      throw new Error('Product not found');
    }

    return products;
  },

  async getProduct(idOrSlug: string) {
    if (!idOrSlug) {
      throw new Error('Product ID or slug is required');
    }

    try {
      // First try UUID format
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (
            id, 
            sku, 
            size, 
            color, 
            price, 
            stock_count
          product_variants (
            id, 
            sku, 
            size, 
            color, 
            price, 
            inventory_count
          )
        `)
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to fetch product');
      }

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (err) {
      console.error('Error fetching product:', err);
      throw new Error('Failed to fetch product');
    }
  },

  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addReview(productId: string, userId: string, review: {
    rating: number;
    title: string;
    content: string;
  }) {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating: review.rating,
        title: review.title,
        content: review.content,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};