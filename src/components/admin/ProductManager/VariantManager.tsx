import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Image as ImageIcon } from 'lucide-react';
import { ProductService } from '../../../services/products';

interface VariantManagerProps {
  onClose: () => void;
  onSave: (variants: any[]) => Promise<void>;
}

const VariantManager: React.FC<VariantManagerProps> = ({ onClose, onSave }) => {
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleAddVariant = () => {
    setVariants(prev => [...prev, {
      id: Date.now().toString(),
      sku: '',
      size: '',
      color: '',
      price: '',
      stock: 0,
      images: []
    }]);
  };

  const handleRemoveVariant = (variantId: string) => {
    setVariants(prev => prev.filter(v => v.id !== variantId));
  };

  const handleVariantChange = (variantId: string, field: string, value: any) => {
    setVariants(prev =>
      prev.map(v =>
        v.id === variantId
          ? { ...v, [field]: value }
          : v
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(variants);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Manage Product Variants</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {variants.map((variant) => (
            <div key={variant.id} className="bg-black p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Variant Details</h4>
                <button
                  onClick={() => handleRemoveVariant(variant.id)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Size
                  </label>
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(variant.id, 'color', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Images
                  </label>
                  <button
                    onClick={() => {/* Implement image upload */}}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Add Images
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddVariant}
          className="w-full bg-zinc-800 text-white py-3 rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 mb-6"
        >
          <Plus className="w-5 h-5" />
          Add Variant
        </button>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-[#3dd8e8] text-black rounded-lg hover:bg-[#34c5d3] transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VariantManager;