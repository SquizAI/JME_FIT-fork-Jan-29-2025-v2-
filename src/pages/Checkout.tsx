import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { StripeService } from '../services/stripe';
import MainLayout from '../components/layouts/MainLayout';
import StripeCheckout from '../components/checkout/StripeCheckout';
import PaymentForm from '../components/checkout/PaymentForm';
import ExpressCheckout from '../components/checkout/ExpressCheckout';

const Checkout = () => {
  const { state } = useCart();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const navigate = useNavigate();

  const total = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleExpressCheckout = async (method: 'apple_pay' | 'google_pay') => {
    setLoading(true);
    setError('');

    try {
      const { clientSecret } = await StripeService.createPaymentIntent(
        state.items.map(item => ({
          id: item.productId,
          quantity: item.quantity,
          price: item.price,
          title: item.title,
          images: item.image ? [item.image] : []
        })),
        method
      );

      setClientSecret(clientSecret);
    } catch (err) {
      console.error('Express checkout error:', err);
      setError('Unable to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (email: string) => {
    setEmail(email);
    setShowCardForm(true);
  };

  const handlePayment = async (paymentData: any) => {
    if (!state.items.length) return;
    
    setLoading(true);
    setError('');

    try {
      const { clientSecret } = await StripeService.createPaymentIntent(
        state.items.map(item => ({
          id: item.productId,
          quantity: item.quantity,
          price: item.price,
          title: item.title,
          images: item.image ? [item.image] : []
        }))
      );

      setClientSecret(clientSecret);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Unable to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-400 mb-8">Add some items to your cart to checkout</p>
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#3dd8e8] text-black px-6 py-3 rounded-lg font-semibold"
              >
                Continue Shopping
              </motion.button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-zinc-900 rounded-lg p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Checkout</h2>
            <p className="text-gray-400">Complete your purchase</p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Order Summary</h3>
              {state.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-black p-4 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                      {item.size && (
                        <p className="text-sm text-gray-400">Size: {item.size}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-[#3dd8e8] font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Total</span>
                <span className="text-[#3dd8e8] font-bold">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {clientSecret ? (
              <StripeCheckout 
                clientSecret={clientSecret}
                email={email}
                onSuccess={() => navigate('/checkout/success')}
              />
            ) : showCardForm ? (
              <PaymentForm
                onSubmit={handlePayment}
                loading={loading}
              />
            ) : (
              <div className="space-y-6">
                {/* Express Checkout Options */}
                <ExpressCheckout 
                  onApplePay={() => handleExpressCheckout('apple_pay')}
                  onGooglePay={() => handleExpressCheckout('google_pay')}
                />

                {/* Email Input for Guest/Card Payment */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8] text-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEmailSubmit(email)}
                  disabled={!email}
                  className="w-full bg-[#3dd8e8] text-black py-3 rounded-lg font-semibold hover:bg-[#34c5d3] transition-colors disabled:opacity-50"
                >
                  Continue with Card
                </motion.button>

                {!user && (
                  <div className="text-center space-y-4">
                    <div className="text-sm text-gray-400">
                      Have an account?{' '}
                      <Link 
                        to="/login" 
                        state={{ from: '/checkout' }}
                        className="text-[#3dd8e8] hover:text-[#34c5d3]"
                      >
                        Sign in for faster checkout
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500">
                      By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Checkout;