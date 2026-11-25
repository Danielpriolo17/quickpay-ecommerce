"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const domain_error_1 = require("../errors/domain.error");
const result_1 = require("./result");
(0, globals_1.describe)('ROP Result & DomainError', () => {
    (0, globals_1.describe)('Result monad', () => {
        (0, globals_1.it)('should chain map, flatMap and flatMapAsync on Ok', async () => {
            const initial = (0, result_1.ok)(10);
            const mapped = initial.map((v) => v * 2);
            (0, globals_1.expect)(mapped.isOk).toBe(true);
            if (mapped.isOk)
                (0, globals_1.expect)(mapped.value).toBe(20);
            const flatMapped = mapped.flatMap((v) => (0, result_1.ok)(v + 5));
            (0, globals_1.expect)(flatMapped.isOk).toBe(true);
            if (flatMapped.isOk)
                (0, globals_1.expect)(flatMapped.value).toBe(25);
            const asyncResult = await flatMapped.flatMapAsync(async (v) => (0, result_1.ok)(`total:${v}`));
            (0, globals_1.expect)(asyncResult.isOk).toBe(true);
            if (asyncResult.isOk)
                (0, globals_1.expect)(asyncResult.value).toBe('total:25');
        });
        (0, globals_1.it)('should bypass map, flatMap and flatMapAsync on Fail', async () => {
            const initial = (0, result_1.fail)('boom');
            const fn = globals_1.jest.fn();
            const mapped = initial.map(fn);
            const flatMapped = mapped.flatMap(fn);
            const asyncResult = await flatMapped.flatMapAsync(fn);
            (0, globals_1.expect)(fn).not.toHaveBeenCalled();
            (0, globals_1.expect)(asyncResult.isFail).toBe(true);
            if (asyncResult.isFail)
                (0, globals_1.expect)(asyncResult.error).toBe('boom');
        });
    });
    (0, globals_1.describe)('DomainError factories', () => {
        (0, globals_1.it)('should build all domain errors with proper HTTP status codes', () => {
            (0, globals_1.expect)(domain_error_1.DomainError.productNotFound('p1').httpStatus).toBe(404);
            (0, globals_1.expect)(domain_error_1.DomainError.insufficientStock(2, 5).httpStatus).toBe(409);
            (0, globals_1.expect)(domain_error_1.DomainError.transactionNotFound('t1').httpStatus).toBe(404);
            (0, globals_1.expect)(domain_error_1.DomainError.transactionAlreadyProcessed('t1', 'APPROVED').httpStatus).toBe(409);
            (0, globals_1.expect)(domain_error_1.DomainError.invalidQuantity().httpStatus).toBe(400);
            (0, globals_1.expect)(domain_error_1.DomainError.paymentGatewayError('gateway down').httpStatus).toBe(502);
            (0, globals_1.expect)(domain_error_1.DomainError.persistenceError('db error').httpStatus).toBe(500);
        });
    });
});
//# sourceMappingURL=result.spec.js.map