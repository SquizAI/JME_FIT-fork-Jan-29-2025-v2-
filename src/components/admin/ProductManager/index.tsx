import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Package, ArrowUpDown } from 'lucide-react';
import { ProductService } from '../../../services/products';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import BulkActions from './BulkActions';
import VariantManager from './VariantManager';
import CrossSellManager from './CrossSellManager';
import BundleManager from './BundleManager';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showCrossSell, setShowCrossSell] = useState(false);
  const [showBundles, setShowBundles] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (!selectedProducts.length) return;

    try {
      switch (action) {
        case 'delete':
          // Implement bulk delete
          break;
        case 'updatePrice':
          // Implement bulk price update
          break;
        case 'updateStock':
          // Implement bulk stock update
          break;
        default:
          break;
      }
      await loadProducts();
    } catch (err) {
      console.error('Bulk action error:', err);
      setError('Failed to perform bulk action');
    }
  };

  const handleProductSelect = (productId: string, selected: boolean) => {
    setSelectedProducts(prev => 
      selected 
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#3dd8e8]">Product Management</h2>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#3dd8e8] text-black px-4 py-2 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-zinc-900 p-6 rounded-lg mb-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1">
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
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
          >
            <option value="all">All Categories</option>
            <option value="apparel">Apparel</option>
            <option value="equipment">Equipment</option>
            <option value="supplements">Supplements</option>
            <option value="digital">Digital Products</option>
          </select>
        </div>

        <BulkActions
          selectedCount={selectedProducts.length}
          onAction={handleBulkAction}
        />

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowVariants(true)}
            className="px-4 py-2 bg-black rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Manage Variants
          </button>
          <button
            onClick={() => setShowCrossSell(true)}
            className="px-4 py-2 bg-black rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Cross-Selling
          </button>
          <button
            onClick={() => setShowBundles(true)}
            className="px-4 py-2 bg-black rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Product Bundles
          </button>
        </div>

        <ProductList
          products={products}
          loading={loading}
          selectedProducts={selectedProducts}
          onSelect={handleProductSelect}
          onEdit={setSelectedProduct}
        />
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={selecte dProduct}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
          onSave={async (data) => {
            try {
              if (selectedProduct) {
                await ProductService.updateProduct(selectedProduct.id, data);
              } else {
                await ProductService.createProduct(data);
              }
              await loadProducts();
              setShowForm(false);
              setSelectedProduct(null);
            } catch (err) {
              console.error('Error saving product:', err);
              setError('Failed to save product');
            }
          }}
        />
      )}

      {/* Variant Manager Modal */}
      {showVariants && (
        <VariantManager
          onClose={() => setShowVariants(false)}
          onSave={async (variants) => {
            try {
              // Implement variant save logic
              setShowVariants(false);
            } catch (err) {
              console.error('Error saving variants:', err);
              setError('Failed to save variants');
            }
          }}
        />
      )}

      {/* Cross-Sell Manager Modal */}
      {showCrossSell && (
        <CrossSellManager
          onClose={() => setShowCrossSell(false)}
          onSave={async (relationships) => {
            try {
              // Implement cross-sell save logic
              setShowCrossSell(false);
            } catch (err) {
              console.error('Error saving cross-sell relationships:', err);
              setError('Failed to save cross-sell relationships');
            }
          }}
        />
      )}

      {/* Bundle Manager Modal */}
      {showBundles && (
        <BundleManager
          onClose={() => setShowBundles(false)}
          onSave={async (bundles) => {
            try {
              // Implement bundle save logic
              setShowBundles(false);
            } catch (err) {
              console.error('Error saving bundles:', err);
              setError('Failed to save bundles');
            }
          }}
        />
      )}
    </div>
  );
};

export default ProductManager;