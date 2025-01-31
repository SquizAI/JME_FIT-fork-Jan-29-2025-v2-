import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  title: string;
  subtitle?: string;
  onSkip?: () => void;
  error?: string;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  title,
  subtitle,
  onSkip,
  error
}) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-[#3dd8e8]'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">{title}</h1>
          {subtitle && (
            <p className="text-gray-400 text-center">{subtitle}</p>
          )}

          {error && (
            <div className="mt-4 bg-red-500/10 text-red-500 p-4 rounded-lg">
              {error}
            </div>
          )}

          {onSkip && (
            <div className="mt-4 text-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSkip}
                className="text-gray-400 hover:text-[#3dd8e8] transition-colors"
              >
                Skip for now
              </motion.button>
            </div>
          )}
        </div>

        {children}
      </motion.div>
    </div>
  );
};

export default OnboardingLayout;