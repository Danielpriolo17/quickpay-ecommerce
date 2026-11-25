export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
  imageUrl: string;
}

export type TransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'VOIDED'
  | 'ERROR';

export interface CustomerFormData {
  fullName: string;
  email: string;
  phone: string;
}

export interface DeliveryFormData {
  address: string;
  city: string;
  department: string;
  postalCode: string;
}

export interface CardFormData {
  number: string;
  cardHolder: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  installments: number;
}

export interface TransactionRecord {
  id: string;
  reference: string;
  productId: string;
  customerId: string;
  quantity: number;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalInCents: number;
  status: TransactionStatus;
  externalTransactionId?: string | null;
  cardBrand?: string | null;
  cardLastFour?: string | null;
  statusMessage?: string | null;
}

export interface DeliveryRecord {
  id: string;
  transactionId: string;
  address: string;
  city: string;
  department: string;
  postalCode?: string | null;
  status: 'PENDING' | 'ASSIGNED' | 'DELIVERED' | 'CANCELLED';
}

export type CheckoutStep =
  | 'PRODUCT_LIST'
  | 'PAYMENT_MODAL'
  | 'SUMMARY_BACKDROP'
  | 'RESULT';