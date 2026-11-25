import { Result } from '../../shared/rop/result';
import { DomainError } from '../../shared/errors/domain.error';
import { TransactionStatus } from '../entities/transaction.entity';
export declare const PAYMENT_GATEWAY: unique symbol;
export interface CardDataInput {
    number: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolder: string;
}
export interface ProcessCardPaymentInput {
    reference: string;
    amountInCents: number;
    currency: 'COP';
    customerEmail: string;
    installments: number;
    card: CardDataInput;
}
export interface PaymentGatewayResult {
    externalTransactionId: string;
    status: TransactionStatus;
    cardBrand?: string;
    cardLastFour?: string;
    statusMessage?: string;
}
export interface PaymentGatewayPort {
    processCardPayment(input: ProcessCardPaymentInput): Promise<Result<PaymentGatewayResult, DomainError>>;
}
