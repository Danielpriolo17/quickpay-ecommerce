"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainError = void 0;
class DomainError {
    constructor(code, message, httpStatus, details) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
        this.details = details;
    }
    static productNotFound(productId) {
        return new DomainError('PRODUCT_NOT_FOUND', `Product with id ${productId} was not found`, 404);
    }
    static insufficientStock(available, requested) {
        return new DomainError('INSUFFICIENT_STOCK', `Insufficient stock. Available: ${available}, requested: ${requested}`, 409, { available, requested });
    }
    static transactionNotFound(transactionId) {
        return new DomainError('TRANSACTION_NOT_FOUND', `Transaction with id ${transactionId} was not found`, 404);
    }
    static transactionAlreadyProcessed(transactionId, currentStatus) {
        return new DomainError('TRANSACTION_ALREADY_PROCESSED', `Transaction ${transactionId} is already in final state: ${currentStatus}`, 409, { currentStatus });
    }
    static invalidQuantity() {
        return new DomainError('INVALID_QUANTITY', 'Quantity must be greater than zero', 400);
    }
    static paymentGatewayError(message, details) {
        return new DomainError('PAYMENT_GATEWAY_ERROR', message, 502, details);
    }
    static persistenceError(message) {
        return new DomainError('PERSISTENCE_ERROR', message, 500);
    }
}
exports.DomainError = DomainError;
//# sourceMappingURL=domain.error.js.map