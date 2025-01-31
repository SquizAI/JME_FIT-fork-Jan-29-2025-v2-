import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeCheckoutProps {
  clientSecret: string;
  email: string;
  onSuccess: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ clientSecret, email, onSuccess }) => {
  const options = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#3dd8e8',
        colorBackground: '#18181b',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeCheckoutForm email={email} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripeCheckout;