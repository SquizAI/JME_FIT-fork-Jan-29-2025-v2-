import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface StripeCheckoutFormProps {
  email: string;
  onSuccess: () => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({ email, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // Validate payment element first
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          receipt_email: email,
          payment_method_data: {
            billing_details: {
              email: email
            }
          }
        }
      });

      if (confirmError) {
        // Handle specific error cases
        if (confirmError.type === 'card_error' || confirmError.type === 'validation_error') {
          throw new Error(confirmError.message);
        } else {
          throw new Error('An unexpected error occurred. Please try again.');
        }
      }

      // Clear any stored payment state
      sessionStorage.removeItem('stripe_payment_intent');
      localStorage.removeItem('cart_items');

      onSuccess();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <PaymentElement />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[#3dd8e8] text-black py-3 rounded-lg font-semibold hover:bg-[#34c5d3] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
            Processing...
          </div>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay Now
          </>
        )}
      </motion.button>

      <div className="text-center text-sm text-gray-400">
        <Lock className="inline-block w-4 h-4 mr-1" />
        Secure payment powered by Stripe
      </div>
    </form>
  );
};

export default StripeCheckoutForm;