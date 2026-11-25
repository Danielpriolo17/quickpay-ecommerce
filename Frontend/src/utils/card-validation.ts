export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

export function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = sanitizeDigits(cardNumber);
  if (/^4/.test(digits)) {
    return 'VISA';
  }
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) {
    return 'MASTERCARD';
  }
  return 'UNKNOWN';
}

export function formatCardNumber(cardNumber: string): string {
  const digits = sanitizeDigits(cardNumber).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function isValidLuhn(cardNumber: string): boolean {
  const digits = sanitizeDigits(cardNumber);
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function isValidExpiry(expMonth: string, expYear: string): boolean {
  const month = parseInt(expMonth, 10);
  const year = parseInt(expYear, 10);

  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    return false;
  }

  const fullYear = year < 100 ? 2000 + year : year;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (fullYear < currentYear) return false;
  if (fullYear === currentYear && month < currentMonth) return false;
  return fullYear <= currentYear + 20;
}

export function isValidCvc(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc);
}