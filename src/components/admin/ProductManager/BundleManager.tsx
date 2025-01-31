import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Plus, Minus, Package } from 'lucide-react';
import { ProductService } from '../../../services/products';

interface BundleManagerProps {
  onClose: () => void;
  onSave: (bundles: any[]) => Promise<void>;
}

const BundleManager: React.FC<BundleManagerProps> = ({ onClose, onSave }) => {
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [bundlePrice, setBundlePrice] = useState('');

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

  const handleAddProduct = (product: any) => {
    setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, quantity: Math.max(1, p.quantity + delta) }
          : p
      )
    );
  };

  const handleCreateBundle = async () => {
    if (!bundleName || !bundlePrice || selectedProducts.length === 0) return;

    const bundle = {
      name: bundleName,
      price: parseFloat(bundlePrice),
      products: selectedProducts
    };

    setBundles(prev => [...prev, bundle]);
    setBundleName('');
    setBundlePrice('');
    setSelectedProducts([]);
  };

  const handleSave = async () => {
    await onSave(bundles);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Create Product Bundle</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-4">Available Products</h4>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map((product: any) => (
                <div key={product.id} className="bg-black p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-400">${product.price}</p>
                  </div>
                  <button
                    onClick={() => handleAddProduct(product)}
                    className="text-[#3dd8e8] hover:text-[#34c5d3]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Bundle Configuration</h4>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Bundle Name"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                className="w-full px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
              />
              <input
                type="number"
                placeholder="Bundle Price"
                value={bundlePrice}
                onChange={(e) => setBundlePrice(e.target.value)}
                className="w-full px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
              />
            </div>

            <div className="space-y-2">
              {selectedProducts.map((product) => (
                <div key={product.id} className="bg-black p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-400">${product.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(product.id, -1)}
                      className="p-1 hover:bg-zinc-800 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span>{product.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(product.id, 1)}
                      className="p-1 hover:bg-zinc-800 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedProducts.length > 0 && (
              <button
                onClick={handleCreateBundle}
                className="w-full mt-4 bg-[#3dd8e8] text-black py-2 rounded-lg hover:bg-[#34c5d3] transition-colors"
              >
                Create Bundle
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-800 pt-6">
          <h4 className="font-medium mb-4">Created Bundles</h4>
          <div className="space-y-4">
            {bundles.map((bundle, index) => (
              <div key={index} className="bg-black p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-medium">{bundle.name}</h5>
                    <p className="text-sm text-gray-400">${bundle.price}</p>
                  </div>
                  <Package className="w-5 h-5 text-[#3dd8e8]" />
                </div>
                <div className="space-y-1">
                  {bundle.products.map((product: any) => (
                    <p key={product.id} className="text-sm text-gray-400">
                      {product.quantity}x {product.name}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
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

export default BundleManager;