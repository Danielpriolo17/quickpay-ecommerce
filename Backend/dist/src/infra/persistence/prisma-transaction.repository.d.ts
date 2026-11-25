import { Transaction } from '../../domain/entities/transaction.entity';
import { CreateTransactionData, TransactionRepositoryPort, UpdateTransactionResultData } from '../../domain/ports/transaction.repository.port';
import { PrismaService } from './prisma.service';
export declare class PrismaTransactionRepository implements TransactionRepositoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateTransactionData): Promise<Transaction>;
    findById(id: string): Promise<Transaction | null>;
    findByReference(reference: string): Promise<Transaction | null>;
    updateResult(id: string, data: UpdateTransactionResultData): Promise<Transaction>;
    private toDomain;
}
