import { Delivery } from '../../domain/entities/delivery.entity';
import { Product } from '../../domain/entities/product.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { CustomerRepositoryPort } from '../../domain/ports/customer.repository.port';
import { DeliveryRepositoryPort } from '../../domain/ports/delivery.repository.port';
import { CardDataInput, PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { DomainError } from '../../shared/errors/domain.error';
import { Result } from '../../shared/rop/result';
export interface ProcessPaymentInput {
    transactionId: string;
    installments: number;
    card: CardDataInput;
}
export interface ProcessPaymentOutput {
    transaction: Transaction;
    delivery: Delivery;
    product: Product;
}
export declare class ProcessPaymentUseCase {
    private readonly transactionRepository;
    private readonly productRepository;
    private readonly customerRepository;
    private readonly deliveryRepository;
    private readonly paymentGateway;
    constructor(transactionRepository: TransactionRepositoryPort, productRepository: ProductRepositoryPort, customerRepository: CustomerRepositoryPort, deliveryRepository: DeliveryRepositoryPort, paymentGateway: PaymentGatewayPort);
    execute(input: ProcessPaymentInput): Promise<Result<ProcessPaymentOutput, DomainError>>;
    private loadAndValidateContext;
    private chargeWithGateway;
    private finalizeOrder;
}
