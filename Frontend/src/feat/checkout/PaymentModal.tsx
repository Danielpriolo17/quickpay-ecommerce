import { Lock, MapPin, User, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { CardBrandBadge } from '../../components/CardBrandBadge';
import type {
  CardFormData,
  CustomerFormData,
  DeliveryFormData,
  Product,
} from '../../types/store.types';
import {
  detectCardBrand,
  formatCardNumber,
  isValidCvc,
  isValidExpiry,
  isValidLuhn,
  sanitizeDigits,
} from '../../utils/card-validation';
import { formatCOPFromCents } from '../../utils/currency';

interface PaymentModalProps {
  product: Product;
  quantity: number;
  initialCustomer: CustomerFormData;
  initialDelivery: DeliveryFormData;
  initialCard: CardFormData;
  onClose: () => void;
  onContinue: (payload: {
    customer: CustomerFormData;
    delivery: DeliveryFormData;
    card: CardFormData;
    brand: string;
    lastFour: string;
  }) => void;
}

export function PaymentModal({
  product,
  quantity,
  initialCustomer,
  initialDelivery,
  initialCard,
  onClose,
  onContinue,
}: PaymentModalProps) {
  const [card, setCard] = useState<CardFormData>(initialCard);
  const [customer, setCustomer] = useState<CustomerFormData>(initialCustomer);
  const [delivery, setDelivery] = useState<DeliveryFormData>(initialDelivery);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const brand = detectCardBrand(card.number);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    const cleanCard = sanitizeDigits(card.number);

    if (!isValidLuhn(cleanCard)) {
      nextErrors.cardNumber = 'Ingresa un número de tarjeta válido (Luhn).';
    }
    if (!card.cardHolder.trim() || card.cardHolder.trim().length < 3) {
      nextErrors.cardHolder = 'Ingresa el nombre tal como aparece en la tarjeta.';
    }
    if (!isValidExpiry(card.expMonth, card.expYear)) {
      nextErrors.expiry = 'Fecha de expiración inválida o vencida.';
    }
    if (!isValidCvc(card.cvc)) {
      nextErrors.cvc = 'CVC de 3 o 4 dígitos.';
    }
    if (!customer.fullName.trim()) {
      nextErrors.fullName = 'El nombre completo es obligatorio.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!/^[+\d\s()-]{7,25}$/.test(customer.phone.trim())) {
      nextErrors.phone = 'Ingresa un teléfono válido.';
    }
    if (!delivery.address.trim()) {
      nextErrors.address = 'La dirección de entrega es obligatoria.';
    }
    if (!delivery.city.trim()) {
      nextErrors.city = 'La ciudad es obligatoria.';
    }
    if (!delivery.department.trim()) {
      nextErrors.department = 'El departamento es obligatorio.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const cleanCard = sanitizeDigits(card.number);
    onContinue({
      customer,
      delivery,
      card: {
        ...card,
        number: cleanCard,
        expMonth: card.expMonth.padStart(2, '0'),
        expYear: card.expYear.slice(-2),
      },
      brand: brand === 'UNKNOWN' ? 'CARD' : brand,
      lastFour: cleanCard.slice(-4),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2
              id="payment-modal-title"
              className="text-base font-bold text-slate-900 sm:text-lg"
            >
              Datos de pago y envío
            </h2>
            <p className="text-xs text-slate-500">
              {product.name} × {quantity} ·{' '}
              {formatCOPFromCents(product.priceInCents * quantity)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 space-y-5 overflow-y-auto px-5 py-4"
        >
          {/* Credit Card Section */}
          <fieldset className="space-y-3">
            <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
              <Lock className="h-3.5 w-3.5" />
              Tarjeta de crédito (Sandbox)
            </legend>

            <div>
              <label
                htmlFor="cardNumber"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Número de tarjeta
              </label>
              <div className="relative flex items-center">
                <input
                  id="cardNumber"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  value={formatCardNumber(card.number)}
                  onChange={(e) =>
                    setCard({ ...card, number: sanitizeDigits(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-3 pr-24 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <div className="pointer-events-none absolute right-3">
                  <CardBrandBadge brand={brand} />
                </div>
              </div>
              {errors.cardNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="cardHolder"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Nombre en la tarjeta
              </label>
              <input
                id="cardHolder"
                type="text"
                autoComplete="cc-name"
                placeholder="JUAN PEREZ"
                value={card.cardHolder}
                onChange={(e) =>
                  setCard({ ...card, cardHolder: e.target.value.toUpperCase() })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {errors.cardHolder && (
                <p className="mt-1 text-xs text-red-600">{errors.cardHolder}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label
                  htmlFor="expMonth"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  Mes (MM)
                </label>
                <input
                  id="expMonth"
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="08"
                  value={card.expMonth}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      expMonth: sanitizeDigits(e.target.value).slice(0, 2),
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="expYear"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  Año (AA)
                </label>
                <input
                  id="expYear"
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="29"
                  value={card.expYear}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      expYear: sanitizeDigits(e.target.value).slice(0, 2),
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="cvc"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  CVC
                </label>
                <input
                  id="cvc"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="123"
                  value={card.cvc}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      cvc: sanitizeDigits(e.target.value).slice(0, 4),
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
            {(errors.expiry || errors.cvc) && (
              <p className="text-xs text-red-600">
                {errors.expiry || errors.cvc}
              </p>
            )}

            <div>
              <label
                htmlFor="installments"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Cuotas
              </label>
              <select
                id="installments"
                value={card.installments}
                onChange={(e) =>
                  setCard({ ...card, installments: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {[1, 2, 3, 6, 12, 24, 36].map((n) => (
                  <option key={n} value={n}>
                    {n === 1 ? '1 cuota (sin interés)' : `${n} cuotas`}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          {/* Customer Section */}
          <fieldset className="space-y-3 border-t border-slate-100 pt-4">
            <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
              <User className="h-3.5 w-3.5" />
              Datos del cliente
            </legend>

            <div>
              <label
                htmlFor="fullName"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Juan Pérez"
                value={customer.fullName}
                onChange={(e) =>
                  setCustomer({ ...customer, fullName: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+573001234567"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Delivery Section */}
          <fieldset className="space-y-3 border-t border-slate-100 pt-4">
            <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
              <MapPin className="h-3.5 w-3.5" />
              Dirección de entrega
            </legend>

            <div>
              <label
                htmlFor="address"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Dirección
              </label>
              <input
                id="address"
                type="text"
                placeholder="Calle 45 # 12-34 Apto 502"
                value={delivery.address}
                onChange={(e) =>
                  setDelivery({ ...delivery, address: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-600">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="city"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  Ciudad
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="Montería"
                  value={delivery.city}
                  onChange={(e) =>
                    setDelivery({ ...delivery, city: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  Departamento
                </label>
                <input
                  id="department"
                  type="text"
                  placeholder="Córdoba"
                  value={delivery.department}
                  onChange={(e) =>
                    setDelivery({ ...delivery, department: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {errors.department && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.department}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Código postal (opcional)
              </label>
              <input
                id="postalCode"
                type="text"
                placeholder="230001"
                value={delivery.postalCode}
                onChange={(e) =>
                  setDelivery({ ...delivery, postalCode: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </fieldset>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Continuar al resumen de pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}