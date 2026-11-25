import { describe, expect, it, jest } from '@jest/globals';
import { DomainError } from '../errors/domain.error';
import { fail, ok } from './result';

describe('ROP Result & DomainError', () => {
  describe('Result monad', () => {
    it('should chain map, flatMap and flatMapAsync on Ok', async () => {
      const initial = ok<number, string>(10);

      const mapped = initial.map((v) => v * 2);
      expect(mapped.isOk).toBe(true);
      if (mapped.isOk) expect(mapped.value).toBe(20);

      const flatMapped = mapped.flatMap((v) => ok(v + 5));
      expect(flatMapped.isOk).toBe(true);
      if (flatMapped.isOk) expect(flatMapped.value).toBe(25);

      const asyncResult = await flatMapped.flatMapAsync(async (v) =>
        ok(`total:${v}`),
      );
      expect(asyncResult.isOk).toBe(true);
      if (asyncResult.isOk) expect(asyncResult.value).toBe('total:25');
    });

    it('should bypass map, flatMap and flatMapAsync on Fail', async () => {
      const initial = fail<number, string>('boom');
      const fn = jest.fn<any>();

      const mapped = initial.map(fn);
      const flatMapped = mapped.flatMap(fn);
      const asyncResult = await flatMapped.flatMapAsync(fn);

      expect(fn).not.toHaveBeenCalled();
      expect(asyncResult.isFail).toBe(true);
      if (asyncResult.isFail) expect(asyncResult.error).toBe('boom');
    });
  });

  describe('DomainError factories', () => {
    it('should build all domain errors with proper HTTP status codes', () => {
      expect(DomainError.productNotFound('p1').httpStatus).toBe(404);
      expect(DomainError.insufficientStock(2, 5).httpStatus).toBe(409);
      expect(DomainError.transactionNotFound('t1').httpStatus).toBe(404);
      expect(
        DomainError.transactionAlreadyProcessed('t1', 'APPROVED').httpStatus,
      ).toBe(409);
      expect(DomainError.invalidQuantity().httpStatus).toBe(400);
      expect(DomainError.paymentGatewayError('gateway down').httpStatus).toBe(
        502,
      );
      expect(DomainError.persistenceError('db error').httpStatus).toBe(500);
    });
  });
});