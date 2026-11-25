import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiService } from '../../services/api.service';
import type {
  CardFormData,
  CheckoutStep,
  CustomerFormData,
  DeliveryFormData,
  DeliveryRecord,
  Product,
  TransactionRecord,
} from '../../types/store.types';
import { updateProductInList } from '../products/productsSlice';

export interface CheckoutState {
  step: CheckoutStep;
  selectedProduct: Product | null;
  quantity: number;
  customer: CustomerFormData;
  delivery: DeliveryFormData;
  cardSummary: {
    brand: string;
    lastFour: string;
    cardHolder: string;
    installments: number;
  } | null;
  currentTransaction: TransactionRecord | null;
  currentDelivery: DeliveryRecord | null;
  processing: boolean;
  error: string | null;
}

export const INITIAL_CHECKOUT_STATE: CheckoutState = {
  step: 'PRODUCT_LIST',
  selectedProduct: null,
  quantity: 1,
  customer: {
    fullName: '',
    email: '',
    phone: '',
  },
  delivery: {
    address: '',
    city: '',
    department: '',
    postalCode: '',
  },
  cardSummary: null,
  currentTransaction: null,
  currentDelivery: null,
  processing: false,
  error: null,
};

export const executeCheckoutPayment = createAsyncThunk(
  'checkout/executePayment',
  async (
    payload: {
      productId: string;
      quantity: number;
      customer: CustomerFormData;
      delivery: DeliveryFormData;
      card: CardFormData;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      // 1. Crear transacción en PENDING en el backend
      const created = await apiService.createTransaction({
        productId: payload.productId,
        quantity: payload.quantity,
        customer: payload.customer,
        delivery: payload.delivery,
      });

      // 2. Procesar pago en el backend contra la pasarela Sandbox
      const processed = await apiService.processPayment(
        created.transaction.id,
        payload.card,
      );

      // 3. Actualizar el stock en el catálogo en memoria
      dispatch(updateProductInList(processed.product));

      return processed;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          'No fue posible completar el pago. Verifica los datos e intenta de nuevo.';
        return rejectWithValue(
          Array.isArray(message) ? message.join(', ') : String(message),
        );
      }
      return rejectWithValue('Ocurrió un error inesperado al procesar el pago.');
    }
  },
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: INITIAL_CHECKOUT_STATE,
  reducers: {
    startCheckout(
      state,
      action: PayloadAction<{ product: Product; quantity: number }>,
    ) {
      state.selectedProduct = action.payload.product;
      state.quantity = action.payload.quantity;
      state.step = 'PAYMENT_MODAL';
      state.error = null;
    },
    setStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
      state.error = null;
    },
    saveCheckoutDetails(
      state,
      action: PayloadAction<{
        customer: CustomerFormData;
        delivery: DeliveryFormData;
        cardSummary: {
          brand: string;
          lastFour: string;
          cardHolder: string;
          installments: number;
        };
      }>,
    ) {
      state.customer = action.payload.customer;
      state.delivery = action.payload.delivery;
      state.cardSummary = action.payload.cardSummary;
      state.step = 'SUMMARY_BACKDROP';
      state.error = null;
    },
    clearCheckoutError(state) {
      state.error = null;
    },
    resetCheckout() {
      return INITIAL_CHECKOUT_STATE;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(executeCheckoutPayment.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(executeCheckoutPayment.fulfilled, (state, action) => {
        state.processing = false;
        state.currentTransaction = action.payload.transaction;
        state.currentDelivery = action.payload.delivery;
        state.selectedProduct = action.payload.product;
        state.step = 'RESULT';
      })
      .addCase(executeCheckoutPayment.rejected, (state, action) => {
        state.processing = false;
        state.error = (action.payload as string) || 'Error procesando el pago';
      });
  },
});

export const {
  startCheckout,
  setStep,
  saveCheckoutDetails,
  clearCheckoutError,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;