import { Injectable } from '@nestjs/common';
import { Transaction as PrismaTransaction } from '@prisma/client';
import {
  Transaction,
  TransactionStatus,
} from '../../domain/entities/transaction.entity';
import {
  CreateTransactionData,
  TransactionRepositoryPort,
  UpdateTransactionResultData,
} from '../../domain/ports/transaction.repository.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTransactionData): Promise<Transaction> {
    const record = await this.prisma.transaction.create({
      data: {
        reference: data.reference,
        productId: data.productId,
        customerId: data.customerId,
        quantity: data.quantity,
        productAmountInCents: data.productAmountInCents,
        baseFeeInCents: data.baseFeeInCents,
        deliveryFeeInCents: data.deliveryFeeInCents,
        totalInCents: data.totalInCents,
        status: 'PENDING',
      },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({
      where: { reference },
    });
    return record ? this.toDomain(record) : null;
  }

  async updateResult(
    id: string,
    data: UpdateTransactionResultData,
  ): Promise<Transaction> {
    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: data.status,
        externalTransactionId: data.externalTransactionId,
        cardBrand: data.cardBrand,
        cardLastFour: data.cardLastFour,
        statusMessage: data.statusMessage,
      },
    });
    return this.toDomain(updated);
  }

  private toDomain(record: PrismaTransaction): Transaction {
    return new Transaction({
      id: record.id,
      reference: record.reference,
      productId: record.productId,
      customerId: record.customerId,
      quantity: record.quantity,
      productAmountInCents: record.productAmountInCents,
      baseFeeInCents: record.baseFeeInCents,
      deliveryFeeInCents: record.deliveryFeeInCents,
      totalInCents: record.totalInCents,
      status: record.status as TransactionStatus,
      externalTransactionId: record.externalTransactionId,
      paymentMethodType: record.paymentMethodType,
      cardBrand: record.cardBrand,
      cardLastFour: record.cardLastFour,
      statusMessage: record.statusMessage,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}