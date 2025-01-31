import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCheckout } from '../../contexts/CheckoutContext';

const CheckoutSteps = () => {
  const { state } = useCheckout();

  return (
    <div className="flex items-center justify-center mb-8">
      {state.steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed
                  ? 'bg-[#3dd8e8] text-black'
                  : state.currentStep === step.id
                  ? 'bg-[#3dd8e8]/20 text-[#3dd8e8]'
                  : 'bg-zinc-800 text-gray-400'
              }`}
            >
              {step.completed ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>
            <span className="ml-2 text-sm hidden sm:block">
              {step.label}
            </span>
          </div>
          {index < state.steps.length - 1 && (
            <div className="w-12 h-px bg-zinc-800 mx-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};