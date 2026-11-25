import { configureStore } from '@reduxjs/toolkit';
import { apiService } from '../services/api.service';
import checkoutReducer, {
  clearCheckoutError,
  executeCheckoutPayment,
  INITIAL_CHECKOUT_STATE,
  resetCheckout,
  saveCheckoutDetails,
  setStep,
  startCheckout,
} from './checkout/checkoutSlice';
import productsReducer, {
  fetchProducts,
  updateProductInList,
} from './products/productsSlice';

jest.mock('../services/api.service', () => ({
  apiService: {
    getProducts: jest.fn(),
    createTransaction: jest.fn(),
    processPayment: jest.fn(),
    getTransaction: jest.fn(),
  },
}));

const mockedApi = apiService as jest.Mocked<typeof apiService>;

const sampleProduct = {
  id: 'prod-1',
  name: 'Audífonos ANC',
  description: 'Alta fidelidad',
  priceInCents: 24990000,
  stock: 10,
  imageUrl: 'https://img.test/1.jpg',
};

describe('Redux Slices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('productsSlice fetches and updates product stock', async () => {
    mockedApi.getProducts.mockResolvedValue([sampleProduct]);

    const store = configureStore({
      reducer: { products: productsReducer, checkout: checkoutReducer },
    });

    await store.dispatch(fetchProducts());
    expect(store.getState().products.items).toHaveLength(1);
    expect(store.getState().products.loading).toBe(false);

    store.dispatch(updateProductInList({ ...sampleProduct, stock: 9 }));
    expect(store.getState().products.items[0].stock).toBe(9);
  });

  it('productsSlice handles fetch error', async () => {
    mockedApi.getProducts.mockRejectedValue(new Error('Network error'));
    const store = configureStore({
      reducer: { products: productsReducer },
    });

    await store.dispatch(fetchProducts());
    expect(store.getState().products.error).toBeTruthy();
  });

  it('checkoutSlice manages reducers and full payment thunk', async () => {
    const updatedProduct = { ...sampleProduct, stock: 9 };
    const createdTx = {
      id: 'tx-1',
      reference: 'TXN-1',
      productId: 'prod-1',
      customerId: 'cust-1',
      quantity: 1,
      productAmountInCents: 24990000,
      baseFeeInCents: 300000,
      deliveryFeeInCents: 1000000,
      totalInCents: 26290000,
      status: 'PENDING' as const,
    };
    const approvedTx = { ...createdTx, status: 'APPROVED' as const };
    const delivery = {
      id: 'del-1',
      transactionId: 'tx-1',
      address: 'Calle 10',
      city: 'Montería',
      department: 'Córdoba',
      status: 'ASSIGNED' as const,
    };

    mockedApi.createTransaction.mockResolvedValue({
      transaction: createdTx,
      delivery,
      product: sampleProduct,
    });
    mockedApi.processPayment.mockResolvedValue({
      transaction: approvedTx,
      delivery,
      product: updatedProduct,
    });

    const store = configureStore({
      reducer: { products: productsReducer, checkout: checkoutReducer },
    });

    store.dispatch(startCheckout({ product: sampleProduct, quantity: 1 }));
    expect(store.getState().checkout.step).toBe('PAYMENT_MODAL');

    store.dispatch(
      saveCheckoutDetails({
        customer: {
          fullName: 'Juan Pérez',
          email: 'juan@test.com',
          phone: '+573001234567',
        },
        delivery: {
          address: 'Calle 10',
          city: 'Montería',
          department: 'Córdoba',
          postalCode: '230001',
        },
        cardSummary: {
          brand: 'VISA',
          lastFour: '4242',
          cardHolder: 'JUAN PEREZ',
          installments: 1,
        },
      }),
    );
    expect(store.getState().checkout.step).toBe('SUMMARY_BACKDROP');

    await store.dispatch(
      executeCheckoutPayment({
        productId: 'prod-1',
        quantity: 1,
        customer: store.getState().checkout.customer,
        delivery: store.getState().checkout.delivery,
        card: {
          number: '4242424242424242',
          cardHolder: 'JUAN PEREZ',
          expMonth: '08',
          expYear: '29',
          cvc: '123',
          installments: 1,
        },
      }),
    );

    expect(store.getState().checkout.step).toBe('RESULT');
    expect(store.getState().checkout.currentTransaction?.status).toBe(
      'APPROVED',
    );

    store.dispatch(setStep('PRODUCT_LIST'));
    store.dispatch(clearCheckoutError());
    store.dispatch(resetCheckout());
    expect(store.getState().checkout).toEqual(INITIAL_CHECKOUT_STATE);
  });
});