import { ShieldCheck, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './app/store';
import{
  clearCheckoutError,
  executeCheckoutPayment,
  resetCheckout,
  saveCheckoutDetails,
  setStep,
  startCheckout,
} from './feat/checkout/checkoutSlice';
import { PaymentModal } from './feat/checkout/PaymentModal';
import { PaymentResultPage } from './feat/checkout/PaymentResultPage';
import { SummaryBackdrop } from './feat/checkout/SummaryBackdrop';
import { ProductListPage } from './feat/products/ProductListPage';
import { fetchProducts } from './feat/products/productsSlice';
import type { CardFormData, Product } from './types/store.types';

const EMPTY_CARD: CardFormData = {
  number: '',
  cardHolder: '',
  expMonth: '',
  expYear: '',
  cvc: '',
  installments: 1,
};

const BASE_FEE_IN_CENTS = Number(
  import.meta.env.VITE_BASE_FEE_IN_CENTS || 300000,
);
const DELIVERY_FEE_IN_CENTS = Number(
  import.meta.env.VITE_DELIVERY_FEE_IN_CENTS || 1000000,
);

export function App() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: products,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state: RootState) => state.products);

  const checkout = useSelector((state: RootState) => state.checkout);

  // Datos sensibles de tarjeta SOLO en memoria (nunca en localStorage)
  const [cardInMemory, setCardInMemory] = useState<CardFormData>(EMPTY_CARD);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handlePayWithCard = (product: Product, quantity: number) => {
    dispatch(startCheckout({ product, quantity }));
  };

  const handleContinueToSummary = (payload: {
    customer: typeof checkout.customer;
    delivery: typeof checkout.delivery;
    card: CardFormData;
    brand: string;
    lastFour: string;
  }) => {
    setCardInMemory(payload.card);
    dispatch(
      saveCheckoutDetails({
        customer: payload.customer,
        delivery: payload.delivery,
        cardSummary: {
          brand: payload.brand,
          lastFour: payload.lastFour,
          cardHolder: payload.card.cardHolder,
          installments: payload.card.installments,
        },
      }),
    );
  };

  const handleConfirmPayment = async () => {
    if (!checkout.selectedProduct || !cardInMemory.number) return;

    const action = await dispatch(
      executeCheckoutPayment({
        productId: checkout.selectedProduct.id,
        quantity: checkout.quantity,
        customer: checkout.customer,
        delivery: checkout.delivery,
        card: cardInMemory,
      }),
    );

    if (executeCheckoutPayment.fulfilled.match(action)) {
      setCardInMemory(EMPTY_CARD);
    }
  };

  const handleReturnToStore = () => {
    setCardInMemory(EMPTY_CARD);
    dispatch(resetCheckout());
    dispatch(fetchProducts());
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      {/* Header Mobile-First */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <button
            type="button"
            onClick={handleReturnToStore}
            className="flex items-center gap-2 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-base font-extrabold leading-tight text-slate-900">
                NovaStore
              </h1>
              <p className="text-[11px] font-medium text-slate-500">
                Checkout seguro
              </p>
            </div>
          </button>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            HTTPS & Sandbox
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {checkout.step === 'SUMMARY_BACKDROP' && checkout.selectedProduct ? (
          <SummaryBackdrop
            product={checkout.selectedProduct}
            quantity={checkout.quantity}
            customer={checkout.customer}
            delivery={checkout.delivery}
            cardSummary={checkout.cardSummary}
            hasCardInMemory={Boolean(cardInMemory.number)}
            baseFeeInCents={BASE_FEE_IN_CENTS}
            deliveryFeeInCents={DELIVERY_FEE_IN_CENTS}
            processing={checkout.processing}
            error={checkout.error}
            onEditDetails={() => {
              dispatch(clearCheckoutError());
              dispatch(setStep('PAYMENT_MODAL'));
            }}
            onConfirmPayment={handleConfirmPayment}
          />
        ) : checkout.step === 'RESULT' && checkout.currentTransaction ? (
          <PaymentResultPage
            transaction={checkout.currentTransaction}
            delivery={checkout.currentDelivery}
            product={checkout.selectedProduct}
            onReturnToStore={handleReturnToStore}
          />
        ) : (
          <ProductListPage
            products={products}
            loading={productsLoading}
            error={productsError}
            onRetry={() => dispatch(fetchProducts())}
            onPayWithCard={handlePayWithCard}
          />
        )}

        {checkout.step === 'PAYMENT_MODAL' && checkout.selectedProduct && (
          <PaymentModal
            product={checkout.selectedProduct}
            quantity={checkout.quantity}
            initialCustomer={checkout.customer}
            initialDelivery={checkout.delivery}
            initialCard={cardInMemory}
            onClose={() => dispatch(setStep('PRODUCT_LIST'))}
            onContinue={handleContinueToSummary}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        NovaStore · Entorno de pruebas Sandbox
      </footer>
    </div>
  );
}

export default App;