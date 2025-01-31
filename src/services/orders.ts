import { supabase } from '../lib/supabase';

export const OrderService = {
  async getUserOrders(userId: string) {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (orders?.length) {
      // Fetch order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orders.map(o => o.id));

      // Fetch products for order items
      const productIds = orders
        .flatMap(order => orderItems?.filter(item => item.order_id === order.id) || [])
        .map(item => item.product_id)
        .filter(Boolean);

      if (productIds.length) {
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        // Attach products to order items
        return orders.map(order => ({
          ...order,
          order_items: orderItems
            ?.filter(item => item.order_id === order.id)
            .map(item => ({
              ...item,
              product: products?.find(p => p.id === item.product_id)
            })) || []
        }));
      }
    }

    return orders;
  },

  async getOrderById(orderId: string) {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return order;
  }
};