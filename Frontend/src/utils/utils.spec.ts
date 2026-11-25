import {
  detectCardBrand,
  formatCardNumber,
  isValidCvc,
  isValidExpiry,
  isValidLuhn,
  sanitizeDigits,
} from './card-validation';
import { formatCOPFromCents } from './currency';

describe('Frontend Utils', () => {
  describe('currency', () => {
    it('formats COP currency from cents', () => {
      const formatted = formatCOPFromCents(24990000);
      expect(formatted).toContain('249.900');
    });
  });

  describe('card-validation', () => {
    it('sanitizes digits and formats card number in groups of 4', () => {
      expect(sanitizeDigits('4242-4242 4242 4242')).toBe('4242424242424242');
      expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    });

    it('detects VISA, MASTERCARD and UNKNOWN brands', () => {
      expect(detectCardBrand('4242424242424242')).toBe('VISA');
      expect(detectCardBrand('5100000000000000')).toBe('MASTERCARD');
      expect(detectCardBrand('2221000000000000')).toBe('MASTERCARD');
      expect(detectCardBrand('378282246310005')).toBe('UNKNOWN');
    });

    it('validates card numbers with Luhn algorithm', () => {
      expect(isValidLuhn('4242424242424242')).toBe(true);
      expect(isValidLuhn('4242424242424241')).toBe(false);
      expect(isValidLuhn('1234')).toBe(false);
    });

    it('validates expiration dates and CVC', () => {
      expect(isValidExpiry('12', '30')).toBe(true);
      expect(isValidExpiry('13', '30')).toBe(false);
      expect(isValidExpiry('01', '20')).toBe(false);
      expect(isValidExpiry('aa', '30')).toBe(false);
      expect(isValidCvc('123')).toBe(true);
      expect(isValidCvc('1234')).toBe(true);
      expect(isValidCvc('12')).toBe(false);
    });
  });
});