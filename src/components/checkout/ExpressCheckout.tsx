import React from 'react';
import { motion } from 'framer-motion';
import { Apple, CreditCard } from 'lucide-react';

interface ExpressCheckoutProps {
  onApplePay: () => void;
  onGooglePay: () => void;
}

const ExpressCheckout: React.FC<ExpressCheckoutProps> = ({ onApplePay, onGooglePay }) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-zinc-900 text-gray-400">Express Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onApplePay}
          className="flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Apple className="w-5 h-5" />
          Apple Pay
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGooglePay}
          className="flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <CreditCard className="w-5 h-5" />
          Google Pay
        </motion.button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-zinc-900 text-gray-400">Or pay with card</span>
        </div>
      </div>
    </div>
  );
};

export default ExpressCheckout;