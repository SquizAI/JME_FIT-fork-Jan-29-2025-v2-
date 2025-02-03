import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartService } from '../services/cart';
import { useAuth } from './AuthContext';
import { stripePromise } from '../config/stripe';
import type { CartItem, CartAction, CartState } from '../types/cart';

const initialState: CartState = {
  items: [],
  isOpen: false,
  loading: false,
  error: null,
  session: null
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload
      };

    case 'ADD_ITEM':
      const existingItem = state.items.find(item => 
        item.productId === action.payload.productId &&
        item.size === action.payload.size
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === action.payload.productId &&
            item.size === action.payload.size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        error: null
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  console.log(CartService);

  // Example function to handle login
  async function login(username: string, password: string) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('sessionToken', data.token); // Store session token
      // ... existing code ...
    } catch (error) {
      console.error('Login error:', error);
      // Provide user feedback or retry options
    }
  }

  // Example function to check session
  function checkSession() {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
      // Redirect to login or show login modal
    }
    // Validate token with server if necessary
  }

  // Load or create cart session for logged-in users
  useEffect(() => {
    const initializeCart = async () => {
      if (!user) {
        dispatch({ type: 'CLEAR_CART' });
        return;
      }
      
      try {
        let session = await CartService.getActiveSession(user.id);
        if (!session) {
          // Handle the case where no session is found
          // For example, you might want to log an error or create a session differently
        }
        dispatch({ type: 'SET_SESSION', payload: session });
      } catch (error) {
        console.error('Failed to initialize cart:', error);
      }
    };

    initializeCart();
  }, [user]);

  // Load cart from database on mount and user change
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        dispatch({ type: 'CLEAR_CART' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      if (state.loading) return;

      let retryCount = 0;
      const maxRetries = 3;
      let lastError: Error | null = null;

      dispatch({ type: 'SET_LOADING', payload: true });

      const attemptLoad = async () => {
        try {
          // Check network connectivity first
          const networkTest = await fetch('/api/health-check').catch(() => null);
          if (!networkTest) {
            throw new Error('Network connectivity issue');
          }

          let cart = await CartService.getCart(user.id);
          
          if (!cart) {
            cart = await CartService.createCart(user.id);
          }
          
          if (!cart?.id) {
            throw new Error('No cart ID found');
          }
          
          const items = await CartService.getCartItems(cart.id);
          
          dispatch({ type: 'CLEAR_CART' });
          items?.forEach(item => {
            if (item.products) {
              dispatch({
                type: 'ADD_ITEM',
                payload: {
                  id: item.id,
                  productId: item.product_id,
                  quantity: item.quantity,
                  price: item.products.price || 0,
                  title: item.products.name || '',
                  image: item.products.images?.[0]
                }
              });
            }
          });

          dispatch({ type: 'SET_ERROR', payload: null });
          return true;
        } catch (error) {
          console.error('Cart load attempt failed:', error);
          lastError = error;
          if (retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            return false;
          }
          throw error;
        }
      };

      try {
        let success = false;
        while (!success && retryCount < maxRetries) {
          success = await attemptLoad();
        }
      } catch (error) {
        console.error('Failed to load cart after retries:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: lastError?.message?.includes('Failed to fetch')
            ? 'Network error. Please check your connection.'
            : 'Unable to load cart. Please try again.'
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadCart();
  }, [user]);

  // Sync cart changes to database with retry logic
  useEffect(() => {
    const syncCart = async () => {
      if (!user || state.loading) return;
      if (state.items.length === 0) return;

      let retryCount = 0;
      const maxRetries = 3;

      const attemptSync = async () => {
        try {
          await CartService.syncCart(user.id, state.items);
          
          return true;
        } catch (error) {
          console.error('Cart sync attempt failed:', error);
          if (retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            return false;
          }
          throw error;
        }
      };

      try {
        let success = false;
        while (!success && retryCount < maxRetries) {
          success = await attemptSync();
        }
        if (success) {
          dispatch({ type: 'SET_ERROR', payload: null });
        }
      } catch (error) {
        console.error('Failed to sync cart after retries:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Unable to sync cart. Your changes are saved locally.'
        });
      }
    };

    const debounceTimeout = setTimeout(syncCart, 2000); // Increased debounce time
    return () => clearTimeout(debounceTimeout);
  }, [state.items, user]);

  // Example usage of stripePromise
  const handlePayment = async () => {
    const stripe = await stripePromise;
    // Use stripe to handle payment logic
  };

  // Example usage of CartItem
  const addItemToCart = (item: CartItem) => {
    // Logic to add item to cart
  };

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider> 
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};