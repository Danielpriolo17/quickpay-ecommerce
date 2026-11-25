import { Delivery } from '../../domain/entities/delivery.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { DeliveryRepositoryPort } from '../../domain/ports/delivery.repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { DomainError } from '../../shared/errors/domain.error';
import { Result } from '../../shared/rop/result';
export interface TransactionDetailOutput {
    transaction: Transaction;
    delivery: Delivery | null;
}
export declare class GetTransactionUseCase {
    private readonly transactionRepository;
    private readonly deliveryRepository;
    constructor(transactionRepository: TransactionRepositoryPort, deliveryRepository: DeliveryRepositoryPort);
    execute(transactionId: string): Promise<Result<TransactionDetailOutput, DomainError>>;
}
