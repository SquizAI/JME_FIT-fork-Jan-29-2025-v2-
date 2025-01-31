import { supabase } from '../lib/supabase';
import type { ShippingAddress } from '../types/checkout';

export const TaxService = {
  async calculateTax(items: any[], address: ShippingAddress) {
    const { data: rates, error } = await supabase
      .from('tax_rates')
      .select('*')
      .eq('country', address.country)
      .eq('state', address.state)
      .order('priority', { ascending: false });

    if (error) throw error;

    if (!rates?.length) {
      return 0;
    }

    let totalTax = 0;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    for (const rate of rates) {
      if (rate.compound) {
        totalTax += (subtotal + totalTax) * (rate.rate / 100);
      } else {
        totalTax += subtotal * (rate.rate / 100);
      }
    }

    return Math.round(totalTax * 100) / 100; // Round to 2 decimal places
  }
};