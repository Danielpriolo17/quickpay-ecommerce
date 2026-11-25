export function formatCOPFromCents(amountInCents: number): string {
  const amountInPesos = Math.round(amountInCents / 100);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInPesos);
}