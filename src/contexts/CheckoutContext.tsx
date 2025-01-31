import React, { createContext, useContext, useReducer } from 'react';
import type { CheckoutState } from '../types/checkout';

type CheckoutAction = 
  | { type: 'SET_STEP'; payload: string }
  | { type: 'COMPLETE_STEP'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_SHIPPING_ADDRESS'; payload: Partial<ShippingAddress> }
  | { type: 'SET_BILLING_ADDRESS'; payload: Partial<ShippingAddress> }
  | { type: 'SET_SAME_AS_SHIPPING'; payload: boolean }
  | { type: 'SET_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_SAVE_INFO'; payload: boolean }
  | { type: 'SET_EXPRESS_CHECKOUT'; payload: boolean };

const initialState: CheckoutState = {
  steps: [
    { id: 'info', label: 'Information', completed: false },
    { id: 'shipping', label: 'Shipping', completed: false },
    { id: 'payment', label: 'Payment', completed: false },
    { id: 'review', label: 'Review', completed: false }
  ],
  currentStep: 'info',
  email: '',
  shippingAddress: {},
  sameAsShipping: true,
  saveInfo: false,
  expressCheckout: false
};

const checkoutReducer = (state: CheckoutState, action: CheckoutAction): CheckoutState => {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    case 'COMPLETE_STEP':
      return {
        ...state,
        steps: state.steps.map(step => 
          step.id === action.payload ? { ...step, completed: true } : step
        )
      };
    case 'SET_EMAIL':
      return {
        ...state,
        email: action.payload
      };
    case 'SET_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: { ...state.shippingAddress, ...action.payload }
      };
    case 'SET_BILLING_ADDRESS':
      return {
        ...state,
        billingAddress: { ...state.billingAddress, ...action.payload }
      };
    case 'SET_SAME_AS_SHIPPING':
      return {
        ...state,
        sameAsShipping: action.payload,
        billingAddress: action.payload ? state.shippingAddress : {}
      };
    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        selectedPaymentMethod: action.payload
      };
    case 'SET_SAVE_INFO':
      return {
        ...state,
        saveInfo: action.payload
      };
    case 'SET_EXPRESS_CHECKOUT':
      return {
        ...state,
        expressCheckout: action.payload
      };
    default:
      return state;
  }
};

const CheckoutContext = createContext<{
  state: CheckoutState;
  dispatch: React.Dispatch<CheckoutAction>;
} | null>(null);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  return (
    <CheckoutContext.Provider value={{ state, dispatch }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};