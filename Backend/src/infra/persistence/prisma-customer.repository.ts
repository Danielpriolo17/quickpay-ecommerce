import { Injectable } from '@nestjs/common';
import { Customer as PrismaCustomer } from '@prisma/client';
import { Customer } from '../../domain/entities/customer.entity';
import {
  CustomerRepositoryPort,
  UpsertCustomerData,
} from '../../domain/ports/customer.repository.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsertByEmail(data: UpsertCustomerData): Promise<Customer> {
    const record = await this.prisma.customer.upsert({
      where: { email: data.email },
      update: {
        fullName: data.fullName,
        phone: data.phone,
      },
      create: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
      },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  private toDomain(record: PrismaCustomer): Customer {
    return new Customer({
      id: record.id,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}