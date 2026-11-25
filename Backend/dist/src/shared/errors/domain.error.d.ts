export type DomainErrorCode = 'PRODUCT_NOT_FOUND' | 'INSUFFICIENT_STOCK' | 'TRANSACTION_NOT_FOUND' | 'TRANSACTION_ALREADY_PROCESSED' | 'INVALID_QUANTITY' | 'PAYMENT_GATEWAY_ERROR' | 'PAYMENT_DECLINED' | 'PERSISTENCE_ERROR';
export declare class DomainError {
    readonly code: DomainErrorCode;
    readonly message: string;
    readonly httpStatus: number;
    readonly details?: Record<string, unknown>;
    constructor(code: DomainErrorCode, message: string, httpStatus: number, details?: Record<string, unknown>);
    static productNotFound(productId: string): DomainError;
    static insufficientStock(available: number, requested: number): DomainError;
    static transactionNotFound(transactionId: string): DomainError;
    static transactionAlreadyProcessed(transactionId: string, currentStatus: string): DomainError;
    static invalidQuantity(): DomainError;
    static paymentGatewayError(message: string, details?: Record<string, unknown>): DomainError;
    static persistenceError(message: string): DomainError;
}
