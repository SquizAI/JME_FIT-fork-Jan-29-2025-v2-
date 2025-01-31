import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Check } from 'lucide-react';
import type { PaymentMethod } from '../../types/checkout';

interface SavedPaymentMethodsProps {
  methods: PaymentMethod[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const SavedPaymentMethods: React.FC<SavedPaymentMethodsProps> = ({
  methods,
  selectedId,
  onSelect,
  onAdd
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Saved Payment Methods</h3>
      
      <div className="grid gap-4">
        {methods.map((method) => (
          <motion.button
            key={method.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(method.id)}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              selectedId === method.id
                ? 'border-[#3dd8e8] bg-[#3dd8e8]/10'
                : 'border-zinc-800 bg-black hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <CreditCard className={`w-6 h-6 ${
                selectedId === method.id ? 'text-[#3dd8e8]' : 'text-gray-400'
              }`} />
              <div className="text-left">
                <p className="font-medium">
                  {method.brand} •••• {method.last4}
                </p>
                <p className="text-sm text-gray-400">
                  Expires {method.expMonth}/{method.expYear}
                </p>
              </div>
            </div>
            {selectedId === method.id && (
              <Check className="w-5 h-5 text-[#3dd8e8]" />
            )}
          </motion.button>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAdd}
          className="flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-zinc-800 hover:border-[#3dd8e8] hover:bg-[#3dd8e8]/10 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Card
        </motion.button>
      </div>
    </div>
  );
};

export default SavedPaymentMethods;