import { supabase } from '../lib/supabase';
import type { ShippingAddress } from '../types/checkout';

export const ShippingService = {
  async calculateShipping(items: any[], address: ShippingAddress) {
    const { data: zone, error: zoneError } = await supabase
      .from('shipping_zones')
      .select(`
        *,
        shipping_methods (*)
      `)
      .contains('countries', [address.country])
      .single();

    if (zoneError) throw zoneError;

    if (!zone) {
      throw new Error('No shipping available for this location');
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const availableMethods = zone.shipping_methods.filter(method => {
      const meetsMinimum = !method.min_order_amount || totalAmount >= method.min_order_amount;
      const meetsMaximum = !method.max_order_amount || totalAmount <= method.max_order_amount;
      return meetsMinimum && meetsMaximum;
    });

    return availableMethods.map(method => ({
      id: method.id,
      name: method.name,
      price: method.free_shipping_threshold && totalAmount >= method.free_shipping_threshold 
        ? 0 
        : method.price
    }));
  },

  async validateAddress(address: ShippingAddress) {
    // Add address validation logic here
    // Could integrate with external service like Shippo or AddressComplete
    return true;
  }
};