import { CreditCard, Minus, Package, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../../types/store.types';
import { formatCOPFromCents } from '../../utils/currency';
interface ProductListPageProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onPayWithCard: (product: Product, quantity: number) => void;
}

export function ProductListPage({
  products,
  loading,
  error,
  onRetry,
  onPayWithCard,
}: ProductListPageProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQuantity = (productId: string) => quantities[productId] ?? 1;

  const updateQuantity = (productId: string, nextValue: number, max: number) => {
    const clamped = Math.max(1, Math.min(nextValue, max));
    setQuantities((prev) => ({ ...prev, [productId]: clamped }));
  };

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((skeleton) => (
          <div
            key={skeleton}
            className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-4 aspect-[4/3] w-full rounded-xl bg-slate-200" />
            <div className="mb-2 h-5 w-3/4 rounded bg-slate-200" />
            <div className="mb-4 h-4 w-full rounded bg-slate-200" />
            <div className="h-11 w-full rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="mb-4 text-sm font-medium text-red-700">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <section aria-label="Catálogo de productos">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Productos disponibles
        </h2>
        <p className="text-sm text-slate-600">
          Selecciona un artículo y completa tu compra de forma rápida y segura.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const outOfStock = product.stock <= 0;
          const qty = Math.min(getQuantity(product.id), Math.max(1, product.stock));

          return (
            <article
              key={product.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
                <span
                  className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                    outOfStock
                      ? 'bg-red-100 text-red-700'
                      : product.stock <= 5
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <Package className="h-3.5 w-3.5" />
                  {outOfStock ? 'Agotado' : `${product.stock} disponibles`}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="mb-1.5 text-base font-bold text-slate-900 sm:text-lg">
                  {product.name}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">
                  {product.description}
                </p>

                <div className="mb-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="block text-xs text-slate-500">Precio</span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {formatCOPFromCents(product.priceInCents)}
                    </span>
                  </div>

                  {!outOfStock && (
                    <div
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1"
                      aria-label="Selector de cantidad"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(product.id, qty - 1, product.stock)
                        }
                        disabled={qty <= 1}
                        aria-label="Disminuir cantidad"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-bold text-slate-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(product.id, qty + 1, product.stock)
                        }
                        disabled={qty >= product.stock}
                        aria-label="Aumentar cantidad"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={() => onPayWithCard(product, qty)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <CreditCard className="h-4 w-4" />
                  {outOfStock ? 'Sin stock' : 'Pay with credit card'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}