import axios from 'axios';
import type {
  CardFormData,
  CustomerFormData,
  DeliveryFormData,
  DeliveryRecord,
  Product,
  TransactionRecord,
} from '../types/store.types';

import { env } from '../config/env';

const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CreateTransactionResponse {
  transaction: TransactionRecord;
  delivery: DeliveryRecord;
  product: Product;
}

export interface ProcessPaymentResponse {
  transaction: TransactionRecord;
  delivery: DeliveryRecord;
  product: Product;
}

export const apiService = {
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get<{ data: Product[] }>('/products');
    return response.data.data;
  },

  async createTransaction(payload: {
    productId: string;
    quantity: number;
    customer: CustomerFormData;
    delivery: DeliveryFormData;
  }): Promise<CreateTransactionResponse> {
    const response = await apiClient.post<{ data: CreateTransactionResponse }>(
      '/transactions',
      {
        productId: payload.productId,
        quantity: payload.quantity,
        customer: payload.customer,
        delivery: {
          ...payload.delivery,
          postalCode: payload.delivery.postalCode || undefined,
        },
      },
    );
    return response.data.data;
  },

  async processPayment(
    transactionId: string,
    card: CardFormData,
  ): Promise<ProcessPaymentResponse> {
    const response = await apiClient.post<{ data: ProcessPaymentResponse }>(
      `/transactions/${transactionId}/pay`,
      {
        installments: card.installments,
        card: {
          number: card.number.replace(/\s+/g, ''),
          cvc: card.cvc,
          expMonth: card.expMonth,
          expYear: card.expYear,
          cardHolder: card.cardHolder,
        },
      },
    );
    return response.data.data;
  },

  async getTransaction(transactionId: string): Promise<{
    transaction: TransactionRecord;
    delivery: DeliveryRecord | null;
  }> {
    const response = await apiClient.get<{
      data: {
        transaction: TransactionRecord;
        delivery: DeliveryRecord | null;
      };
    }>(`/transactions/${transactionId}`);
    return response.data.data;
  },
};