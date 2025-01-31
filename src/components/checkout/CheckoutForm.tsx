import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface CheckoutFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, loading }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    try {
      await onSubmit({ email });
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8] text-white"
            required
            placeholder="Enter your email"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
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
            Continue to Payment
          </>
        )}
      </motion.button>

      {!user && (
        <div className="text-center text-sm text-gray-400">
          <Lock className="inline-block w-4 h-4 mr-1" />
          Secure checkout powered by Stripe
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;