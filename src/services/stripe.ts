import { supabase } from '../lib/supabase';
import type { CartItem } from '../types/cart';

interface CreatePaymentIntentResponse {
  clientSecret: string;
  id: string;
  amount: number;
}

export const StripeService = {
  async createPaymentIntent(items: CartItem[]): Promise<CreatePaymentIntentResponse> {
    try {
      // Validate input
      if (!items?.length) {
        throw new Error('Your cart is empty');
      }

      // Calculate total amount
      const amount = items.reduce((sum, item) => {
        if (!item.price || item.price <= 0) {
          throw new Error(`Invalid price for item: ${item.title}`);
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Invalid quantity for item: ${item.title}`);
        }
        return sum + (item.price * item.quantity);
      }, 0);

      if (amount <= 0) {
        throw new Error('Invalid order amount');
      }

      // Add timeout to requests
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { 
          items: items.map(item => ({
            id: item.productId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            metadata: {
              size: item.size,
              color: item.color
            }
          }))
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (error) {
        console.error('Payment service error:', error);
        if (error.message?.includes('aborted')) {
          throw new Error('Payment request timed out. Please try again.');
        }
        throw new Error('Payment service is temporarily unavailable. Please try again later.');
      }

      if (!data?.clientSecret || !data?.id) {
        throw new Error('Invalid response from payment service');
      }

      return {
        clientSecret: data.clientSecret,
        id: data.id,
        amount
      };
    } catch (err) {
      console.error('Payment intent error:', err);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Failed to process payment. Please try again.');
    }
  }
};