import { CreditCard } from 'lucide-react';
import type { CardBrand } from '../utils/card-validation';

interface CardBrandBadgeProps {
  brand: CardBrand;
}

export function CardBrandBadge({ brand }: CardBrandBadgeProps) {
  if (brand === 'VISA') {
    return (
      <span
        aria-label="VISA"
        className="inline-flex items-center rounded bg-blue-900 px-2 py-0.5 text-xs font-black italic tracking-wider text-white shadow-sm"
      >
        VISA
      </span>
    );
  }

  if (brand === 'MASTERCARD') {
    return (
      <span
        aria-label="MasterCard"
        className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-xs font-bold text-white shadow-sm"
      >
        <span className="relative flex items-center">
          <span className="h-3.5 w-3.5 rounded-full bg-red-600 opacity-90" />
          <span className="-ml-1.5 h-3.5 w-3.5 rounded-full bg-amber-400 opacity-90" />
        </span>
        <span className="text-[10px] tracking-tight">MasterCard</span>
      </span>
    );
  }

  return <CreditCard className="h-5 w-5 text-slate-400" aria-hidden="true" />;
}