import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import type {
  CustomerFormData,
  DeliveryFormData,
  Product,
} from '../../types/store.types';
import { formatCOPFromCents } from '../../utils/currency';

interface SummaryBackdropProps {
  product: Product;
  quantity: number;
  customer: CustomerFormData;
  delivery: DeliveryFormData;
  cardSummary: {
    brand: string;
    lastFour: string;
    cardHolder: string;
    installments: number;
  } | null;
  hasCardInMemory: boolean;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  processing: boolean;
  error: string | null;
  onEditDetails: () => void;
  onConfirmPayment: () => void;
}

export function SummaryBackdrop({
  product,
  quantity,
  customer,
  delivery,
  cardSummary,
  hasCardInMemory,
  baseFeeInCents,
  deliveryFeeInCents,
  processing,
  error,
  onEditDetails,
  onConfirmPayment,
}: SummaryBackdropProps) {
  const productSubtotal = product.priceInCents * quantity;
  const totalInCents = productSubtotal + baseFeeInCents + deliveryFeeInCents;

  return (
    <section
      aria-label="Resumen de pago"
      className="mx-auto max-w-lg overflow-hidden rounded-3xl bg-brand-900 text-white shadow-xl"
    >
      {/* Back Layer (Material Backdrop) */}
      <div className="px-5 pb-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            disabled={processing}
            onClick={onEditDetails}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-200 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Editar datos
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Paso 3 de 4
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-16 w-16 shrink-0 rounded-xl object-cover ring-2 ring-white/20"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-white">
              {product.name}
            </h2>
            <p className="text-xs text-indigo-200">
              Cantidad: {quantity} {quantity === 1 ? 'unidad' : 'unidades'}
            </p>
            <p className="mt-0.5 text-sm font-bold text-emerald-300">
              {formatCOPFromCents(productSubtotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Front Layer (Elevated Sheet) */}
      <div className="rounded-t-3xl bg-white px-5 pb-6 pt-5 text-slate-900">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

        <h3 className="mb-4 text-base font-bold text-slate-900">
          Resumen de tu pago
        </h3>

        {/* Cost breakdown */}
        <dl className="space-y-2.5 rounded-2xl bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">
              Subtotal producto ({quantity}×)
            </dt>
            <dd className="font-semibold text-slate-900">
              {formatCOPFromCents(productSubtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Tarifa base</dt>
            <dd className="font-semibold text-slate-900">
              {formatCOPFromCents(baseFeeInCents)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Costo de envío</dt>
            <dd className="font-semibold text-slate-900">
              {formatCOPFromCents(deliveryFeeInCents)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 text-base">
            <dt className="font-bold text-slate-900">Total a pagar</dt>
            <dd className="font-extrabold text-brand-600">
              {formatCOPFromCents(totalInCents)}
            </dd>
          </div>
        </dl>

        {/* Payment & Delivery recap */}
        <div className="mt-4 space-y-2.5 text-xs text-slate-600">
          {cardSummary && (
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3">
              <CreditCard className="h-4 w-4 shrink-0 text-brand-600" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">
                  {cardSummary.brand} terminada en •••• {cardSummary.lastFour}
                </p>
                <p className="truncate">
                  {cardSummary.cardHolder} · {cardSummary.installments}{' '}
                  {cardSummary.installments === 1 ? 'cuota' : 'cuotas'}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 p-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{customer.fullName}</p>
              <p>
                {delivery.address}, {delivery.city} ({delivery.department})
              </p>
              <p className="text-slate-500">
                {customer.email} · {customer.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Security refresh notice */}
        {!hasCardInMemory && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Tu sesión se recuperó tras recargar la página. Por seguridad,
              vuelve a ingresar los dígitos de tu tarjeta para confirmar el pago.
            </p>
          </div>
        )}

        {/* API error */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="break-words">{error}</p>
          </div>
        )}

        <div className="mt-5 space-y-2.5">
          {hasCardInMemory ? (
            <button
              type="button"
              disabled={processing}
              onClick={onConfirmPayment}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando pago...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Pagar {formatCOPFromCents(totalInCents)}
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onEditDetails}
              className="w-full rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              Reingresar datos de tarjeta
            </button>
          )}
        </div>
      </div>
    </section>
  );
}