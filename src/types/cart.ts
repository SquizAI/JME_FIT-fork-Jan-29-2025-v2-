export interface CartItem {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string;
}

export interface CartSession {
  id: string;
  user_id: string;
  status: 'active' | 'converted' | 'abandoned' | 'saved';
  expires_at: string;
  metadata?: Record<string, any>;
}

export type CartState = {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  session: CartSession | null;
};

export type CartAction =
  | { type: 'SET_SESSION'; payload: CartSession }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string; size?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; size?: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };