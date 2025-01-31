import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Truck, RefreshCw, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { ProductService } from '../../services/products';
import MainLayout from '../../components/layouts/MainLayout';
import LoadingState from '../../components/common/LoadingState';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (!slug) throw new Error('No product ID provided');

        setLoading(true);
        const data = await ProductService.getProductBySlug(slug);
        
        if (!data) throw new Error('Product not found');

        setProduct(data);
        
        // Set initial selections
        const colors = data.metadata?.colors || [];
        if (colors.length > 0) {
          setSelectedColor(colors[0]);
        }

        const sizes = data.metadata?.sizes || [];
        if (sizes.length > 0) {
          setSelectedSize(sizes[0]);
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `${product.id}-${selectedSize}-${selectedColor}`,
        productId: product.id,
        title: product.name,
        price: product.price,
        quantity,
        size: selectedSize,
        color: selectedColor,
        image: product.metadata?.colorImages?.[selectedColor] || product.images?.[0]
      }
    });

    // Open cart drawer
    dispatch({ type: 'TOGGLE_CART' });
  };

  const updateQuantity = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <LoadingState type="card" count={1} />
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <p className="text-gray-400 mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/shop/gear')}
              className="bg-[#3dd8e8] text-black px-6 py-3 rounded-lg font-semibold"
            >
              Back to Shop
            </motion.button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <img
                src={product.metadata?.colorImages?.[selectedColor] || product.images?.[0]}
                alt={product.name}
                className="w-full h-[500px] object-cover rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-400">{product.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-[#3dd8e8]">
                  ${product.price}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      fill={i < 4 ? "#3dd8e8" : "none"}
                      stroke={i < 4 ? "#3dd8e8" : "currentColor"}
                    />
                  ))}
                  <span className="text-sm text-gray-400">(24 reviews)</span>
                </div>
              </div>

              {/* Colors */}
              {product.metadata?.colors && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Select Color</h3>
                  <div className="flex gap-2">
                    {product.metadata.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`relative w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                          selectedColor === color
                            ? 'bg-[#3dd8e8]/20 ring-2 ring-[#3dd8e8]'
                            : 'bg-black hover:bg-zinc-800'
                        }`}
                      >
                        <span className="text-sm">{color}</span>
                        {selectedColor === color && (
                          <Check className="absolute top-1 right-1 w-3 h-3 text-[#3dd8e8]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.metadata?.sizes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Select Size</h3>
                  <div className="flex gap-2">
                    {product.metadata.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                          selectedSize === size
                            ? 'bg-[#3dd8e8] text-black'
                            : 'bg-black hover:bg-zinc-800'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-black rounded-lg">
                    <button
                      onClick={() => updateQuantity(-1)}
                      className="p-2 hover:bg-zinc-800 rounded-l-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(1)}
                      className="p-2 hover:bg-zinc-800 rounded-r-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">
                    ${(product.price * quantity).toFixed(2)} total
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!selectedSize || (!selectedColor && product.metadata?.colors?.length > 0)}
                className="w-full bg-[#3dd8e8] text-black py-4 rounded-lg font-semibold hover:bg-[#34c5d3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!selectedSize ? 'Select Size' :
                 !selectedColor && product.metadata?.colors?.length > 0 ? 'Select Color' :
                 'Add to Cart'}
              </motion.button>

              {/* Shipping Info */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetails;