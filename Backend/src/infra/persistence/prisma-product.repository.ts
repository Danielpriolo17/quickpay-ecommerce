import { Injectable } from '@nestjs/common';
import { Product as PrismaProduct } from '@prisma/client';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async decrementStock(id: string, quantity: number): Promise<Product> {
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
    return this.toDomain(updated);
  }

  private toDomain(record: PrismaProduct): Product {
    return new Product({
      id: record.id,
      name: record.name,
      description: record.description,
      priceInCents: record.priceInCents,
      stock: record.stock,
      imageUrl: record.imageUrl,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}