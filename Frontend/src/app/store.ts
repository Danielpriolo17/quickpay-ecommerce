import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer, {
  type CheckoutState,
  INITIAL_CHECKOUT_STATE,
} from '../feat/checkout/checkoutSlice';
import productsReducer from '../feat/products/productsSlice';

const STORAGE_KEY = 'quickpay_checkout_state_v1';

function loadPersistedCheckout(): CheckoutState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CHECKOUT_STATE;
    const parsed = JSON.parse(raw) as Partial<CheckoutState>;
    return {
      ...INITIAL_CHECKOUT_STATE,
      ...parsed,
      processing: false,
      error: null,
    };
  } catch {
    return INITIAL_CHECKOUT_STATE;
  }
}

export const store = configureStore({
  reducer: {
    products: productsReducer,
    checkout: checkoutReducer,
  },
  preloadedState: {
    checkout: loadPersistedCheckout(),
  },
});

store.subscribe(() => {
  try {
    const { checkout } = store.getState() as { checkout: CheckoutState };
    const safeToPersist: Partial<CheckoutState> = {
      step: checkout.step,
      selectedProduct: checkout.selectedProduct,
      quantity: checkout.quantity,
      customer: checkout.customer,
      delivery: checkout.delivery,
      cardSummary: checkout.cardSummary,
      currentTransaction: checkout.currentTransaction,
      currentDelivery: checkout.currentDelivery,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeToPersist));
  } catch {
    // Ignorar errores de cuota o modo privado
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;