export type DomainErrorCode =
  | 'PRODUCT_NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'TRANSACTION_NOT_FOUND'
  | 'TRANSACTION_ALREADY_PROCESSED'
  | 'INVALID_QUANTITY'
  | 'PAYMENT_GATEWAY_ERROR'
  | 'PAYMENT_DECLINED'
  | 'PERSISTENCE_ERROR';

export class DomainError {
  constructor(
    readonly code: DomainErrorCode,
    readonly message: string,
    readonly httpStatus: number,
    readonly details?: Record<string, unknown>,
  ) {}

  static productNotFound(productId: string): DomainError {
    return new DomainError(
      'PRODUCT_NOT_FOUND',
      `Product with id ${productId} was not found`,
      404,
    );
  }

  static insufficientStock(available: number, requested: number): DomainError {
    return new DomainError(
      'INSUFFICIENT_STOCK',
      `Insufficient stock. Available: ${available}, requested: ${requested}`,
      409,
      { available, requested },
    );
  }

  static transactionNotFound(transactionId: string): DomainError {
    return new DomainError(
      'TRANSACTION_NOT_FOUND',
      `Transaction with id ${transactionId} was not found`,
      404,
    );
  }

  static transactionAlreadyProcessed(
    transactionId: string,
    currentStatus: string,
  ): DomainError {
    return new DomainError(
      'TRANSACTION_ALREADY_PROCESSED',
      `Transaction ${transactionId} is already in final state: ${currentStatus}`,
      409,
      { currentStatus },
    );
  }

  static invalidQuantity(): DomainError {
    return new DomainError(
      'INVALID_QUANTITY',
      'Quantity must be greater than zero',
      400,
    );
  }

  static paymentGatewayError(
    message: string,
    details?: Record<string, unknown>,
  ): DomainError {
    return new DomainError('PAYMENT_GATEWAY_ERROR', message, 502, details);
  }

  static persistenceError(message: string): DomainError {
    return new DomainError('PERSISTENCE_ERROR', message, 500);
  }
}