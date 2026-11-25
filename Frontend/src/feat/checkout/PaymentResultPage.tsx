import {
  CheckCircle2,
  Clock,
  Home,
  PackageCheck,
  XCircle,
} from 'lucide-react';
import type {
  DeliveryRecord,
  Product,
  TransactionRecord,
} from '../../types/store.types';
import { formatCOPFromCents } from '../../utils/currency';

interface PaymentResultPageProps {
  transaction: TransactionRecord;
  delivery: DeliveryRecord | null;
  product: Product | null;
  onReturnToStore: () => void;
}

export function PaymentResultPage({
  transaction,
  delivery,
  product,
  onReturnToStore,
}: PaymentResultPageProps) {
  const isApproved = transaction.status === 'APPROVED';
  const isPending = transaction.status === 'PENDING';

  return (
    <section
      aria-label="Resultado de la transacción"
      className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-md"
    >
      <div className="mb-6 flex flex-col items-center text-center">
        {isApproved ? (
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
        ) : isPending ? (
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock className="h-9 w-9" />
          </div>
        ) : (
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle className="h-9 w-9" />
          </div>
        )}

        <h2 className="text-xl font-extrabold text-slate-900">
          {isApproved
            ? '¡Pago aprobado!'
            : isPending
              ? 'Pago en proceso'
              : 'Pago rechazado'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {isApproved
            ? 'Tu pedido ha sido confirmado y asignado para entrega.'
            : transaction.statusMessage ||
              'No fue posible aprobar la transacción con la entidad bancaria.'}
        </p>
      </div>

      <dl className="space-y-2.5 rounded-2xl bg-slate-50 p-4 text-xs sm:text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Referencia</dt>
          <dd className="font-mono font-semibold text-slate-900">
            {transaction.reference}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Estado</dt>
          <dd
            className={`font-bold ${
              isApproved
                ? 'text-emerald-700'
                : isPending
                  ? 'text-amber-700'
                  : 'text-red-700'
            }`}
          >
            {transaction.status}
          </dd>
        </div>
        {transaction.externalTransactionId && (
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">ID Pasarela</dt>
            <dd className="truncate font-mono text-slate-800">
              {transaction.externalTransactionId}
            </dd>
          </div>
        )}
        {transaction.cardLastFour && (
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Método</dt>
            <dd className="font-semibold text-slate-900">
              {transaction.cardBrand ?? 'CARD'} •••• {transaction.cardLastFour}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-2 border-t border-slate-200 pt-2.5">
          <dt className="font-bold text-slate-900">Total</dt>
          <dd className="font-extrabold text-brand-600">
            {formatCOPFromCents(transaction.totalInCents)}
          </dd>
        </div>
      </dl>

      {delivery && isApproved && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
          <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <div>
            <p className="font-bold">Entrega asignada ({delivery.status})</p>
            <p>
              {delivery.address}, {delivery.city} - {delivery.department}
            </p>
            {product && (
              <p className="mt-1 text-emerald-800">
                Stock restante del producto: <strong>{product.stock}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onReturnToStore}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
      >
        <Home className="h-4 w-4" />
        Volver a la tienda (ver stock actualizado)
      </button>
    </section>
  );
}