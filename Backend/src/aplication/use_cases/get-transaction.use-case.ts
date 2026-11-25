import { Inject, Injectable } from '@nestjs/common';
import { Delivery } from '../../domain/entities/delivery.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  DELIVERY_REPOSITORY,
  DeliveryRepositoryPort,
} from '../../domain/ports/delivery.repository.port';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '../../domain/ports/transaction.repository.port';
import { DomainError } from '../../shared/errors/domain.error';
import { fail, ok, Result } from '../../shared/rop/result';

export interface TransactionDetailOutput {
  transaction: Transaction;
  delivery: Delivery | null;
}

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(
    transactionId: string,
  ): Promise<Result<TransactionDetailOutput, DomainError>> {
    try {
      const transaction =
        await this.transactionRepository.findById(transactionId);
      if (!transaction) {
        return fail(DomainError.transactionNotFound(transactionId));
      }

      const delivery = await this.deliveryRepository.findByTransactionId(
        transaction.id,
      );

      return ok({ transaction, delivery });
    } catch (error) {
      return fail(
        DomainError.persistenceError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch transaction',
        ),
      );
    }
  }
}