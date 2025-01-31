import { supabase } from '../lib/supabase';

export const InventoryService = {
  async checkAvailability(productId: string, quantity: number) {
    const { data: product, error } = await supabase
      .from('products')
      .select('inventory_count')
      .eq('id', productId)
      .single();

    if (error) throw error;
    return product.inventory_count >= quantity;
  },

  async adjustInventory(productId: string, quantity: number, type: 'sale' | 'return' | 'adjustment', referenceId?: string) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('inventory_count')
      .eq('id', productId)
      .single();

    if (productError) throw productError;

    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        product_id: productId,
        type,
        quantity,
        previous_count: product.inventory_count,
        new_count: product.inventory_count + quantity,
        reference_id: referenceId,
        created_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (transactionError) throw transactionError;

    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        inventory_count: product.inventory_count + quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) throw updateError;
  },

  async getInventoryHistory(productId: string) {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        products (name),
        profiles:created_by (display_name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};