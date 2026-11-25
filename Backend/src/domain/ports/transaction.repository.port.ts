import {
  Transaction,
  TransactionStatus,
} from '../entities/transaction.entity';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface CreateTransactionData {
  reference: string;
  productId: string;
  customerId: string;
  quantity: number;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalInCents: number;
}

export interface UpdateTransactionResultData {
  status: TransactionStatus;
  externalTransactionId?: string;
  cardBrand?: string;
  cardLastFour?: string;
  statusMessage?: string;
}

export interface TransactionRepositoryPort {
  create(data: CreateTransactionData): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByReference(reference: string): Promise<Transaction | null>;
  updateResult(
    id: string,
    data: UpdateTransactionResultData,
  ): Promise<Transaction>;
}