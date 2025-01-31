export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export interface CheckoutStep {
  id: 'info' | 'shipping' | 'payment' | 'review';
  label: string;
  completed: boolean;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface CheckoutState {
  steps: CheckoutStep[];
  currentStep: string;
  email: string;
  shippingAddress: Partial<ShippingAddress>;
  billingAddress?: Partial<ShippingAddress>;
  sameAsShipping: boolean;
  selectedPaymentMethod?: string;
  saveInfo: boolean;
  expressCheckout: boolean;
}