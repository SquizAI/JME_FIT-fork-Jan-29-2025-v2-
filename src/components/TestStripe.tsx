import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import MainLayout from './layouts/MainLayout';

const TestStripe = () => {
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: '36ccea16-19f4-4571-8889-e19bc7a7558e',
        productId: '36ccea16-19f4-4571-8889-e19bc7a7558e',
        title: 'App Workouts (Self-Led)',
        price: 29.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1950&q=80'
      }
    });
    // Open cart drawer
    dispatch({ type: 'TOGGLE_CART' });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Test Product - App Workouts</h2>
            <p className="text-gray-400 mb-4">$29.99/month</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-[#3dd8e8] text-black px-4 py-2 rounded-lg w-full justify-center"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </motion.button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TestStripe;