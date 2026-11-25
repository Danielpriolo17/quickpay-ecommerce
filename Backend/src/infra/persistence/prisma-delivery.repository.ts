import { Injectable } from '@nestjs/common';
import { Delivery as PrismaDelivery } from '@prisma/client';
import { Delivery, DeliveryStatus } from '../../domain/entities/delivery.entity';
import {
  CreateDeliveryData,
  DeliveryRepositoryPort,
} from '../../domain/ports/delivery.repository.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDeliveryData): Promise<Delivery> {
    const record = await this.prisma.delivery.create({
      data: {
        transactionId: data.transactionId,
        customerId: data.customerId,
        address: data.address,
        city: data.city,
        department: data.department,
        postalCode: data.postalCode,
        status: 'PENDING',
      },
    });
    return this.toDomain(record);
  }

  async findByTransactionId(transactionId: string): Promise<Delivery | null> {
    const record = await this.prisma.delivery.findUnique({
      where: { transactionId },
    });
    return record ? this.toDomain(record) : null;
  }

  async updateStatus(
    transactionId: string,
    status: DeliveryStatus,
  ): Promise<Delivery> {
    const updated = await this.prisma.delivery.update({
      where: { transactionId },
      data: { status },
    });
    return this.toDomain(updated);
  }

  private toDomain(record: PrismaDelivery): Delivery {
    return new Delivery({
      id: record.id,
      transactionId: record.transactionId,
      customerId: record.customerId,
      address: record.address,
      city: record.city,
      department: record.department,
      postalCode: record.postalCode,
      status: record.status as DeliveryStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}