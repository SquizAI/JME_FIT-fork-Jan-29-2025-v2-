import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Plus } from 'lucide-react';
import { ProductService } from '../../../services/products';

interface CrossSellManagerProps {
  onClose: () => void;
  onSave: (relationships: any[]) => Promise<void>;
}

const CrossSellManager: React.FC<CrossSellManagerProps> = ({ onClose, onSave }) => {
  const [products, setProducts] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await ProductService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    await onSave(relationships);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Manage Cross-Selling</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {products.map((product: any) => (
            <div key={product.id} className="bg-black p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-gray-400">${product.price}</p>
                </div>
                <button
                  onClick={() => {/* Add cross-sell relationship */}}
                  className="flex items-center gap-2 text-[#3dd8e8]"
                >
                  <Plus className="w-4 h-4" />
                  Add Relationship
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#3dd8e8] text-black rounded-lg hover:bg-[#34c5d3] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CrossSellManager;