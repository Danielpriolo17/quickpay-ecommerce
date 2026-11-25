import { Customer } from '../../domain/entities/customer.entity';
import { Delivery } from '../../domain/entities/delivery.entity';
import { Product } from '../../domain/entities/product.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { CustomerRepositoryPort } from '../../domain/ports/customer.repository.port';
import { DeliveryRepositoryPort } from '../../domain/ports/delivery.repository.port';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { DomainError } from '../../shared/errors/domain.error';
import { Result } from '../../shared/rop/result';
import { FeeConfig } from '../config/fee.config';
export interface CreateTransactionInput {
    productId: string;
    quantity: number;
    customer: {
        fullName: string;
        email: string;
        phone: string;
    };
    delivery: {
        address: string;
        city: string;
        department: string;
        postalCode?: string;
    };
}
export interface CreateTransactionOutput {
    transaction: Transaction;
    customer: Customer;
    delivery: Delivery;
    product: Product;
}
export declare class CreateTransactionUseCase {
    private readonly productRepository;
    private readonly customerRepository;
    private readonly transactionRepository;
    private readonly deliveryRepository;
    private readonly feeConfig;
    constructor(productRepository: ProductRepositoryPort, customerRepository: CustomerRepositoryPort, transactionRepository: TransactionRepositoryPort, deliveryRepository: DeliveryRepositoryPort, feeConfig: FeeConfig);
    execute(input: CreateTransactionInput): Promise<Result<CreateTransactionOutput, DomainError>>;
    private validateQuantity;
    private findAndValidateProduct;
    private upsertCustomer;
    private persistPendingTransactionAndDelivery;
}
