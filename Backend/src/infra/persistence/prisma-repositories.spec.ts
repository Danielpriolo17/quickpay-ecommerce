import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaCustomerRepository } from './prisma-customer.repository';
import { PrismaDeliveryRepository } from './prisma-delivery.repository';
import { PrismaProductRepository } from './prisma-product.repository';
import { PrismaTransactionRepository } from './prisma-transaction.repository';

describe('Prisma Repository Adapters', () => {
  const now = new Date();

  const prismaMock: any = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  customer: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  delivery: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PrismaProductRepository should map records to Product entities', async () => {
    const record = {
      id: 'p1',
      name: 'Item',
      description: 'Desc',
      priceInCents: 1000,
      stock: 5,
      imageUrl: 'url',
      createdAt: now,
      updatedAt: now,
    };
    prismaMock.product.findMany.mockResolvedValue([record]);
    prismaMock.product.findUnique.mockResolvedValueOnce(record);
    prismaMock.product.findUnique.mockResolvedValueOnce(null);
    prismaMock.product.update.mockResolvedValue({ ...record, stock: 4 });

    const repo = new PrismaProductRepository(prismaMock as any);
    expect(await repo.findAll()).toHaveLength(1);
    expect((await repo.findById('p1'))?.id).toBe('p1');
    expect(await repo.findById('none')).toBeNull();
    expect((await repo.decrementStock('p1', 1)).stock).toBe(4);
  });

  it('PrismaCustomerRepository should upsert and find customer', async () => {
    const record = {
      id: 'c1',
      fullName: 'Ana',
      email: 'ana@test.com',
      phone: '300',
      createdAt: now,
      updatedAt: now,
    };
    prismaMock.customer.upsert.mockResolvedValue(record);
    prismaMock.customer.findUnique.mockResolvedValueOnce(record);
    prismaMock.customer.findUnique.mockResolvedValueOnce(null);

    const repo = new PrismaCustomerRepository(prismaMock as any);
    expect(
      (
        await repo.upsertByEmail({
          fullName: 'Ana',
          email: 'ana@test.com',
          phone: '300',
        })
      ).id,
    ).toBe('c1');
    expect((await repo.findById('c1'))?.email).toBe('ana@test.com');
    expect(await repo.findById('missing')).toBeNull();
  });

  it('PrismaTransactionRepository should create, find and update transactions', async () => {
    const record = {
      id: 't1',
      reference: 'TXN-1',
      productId: 'p1',
      customerId: 'c1',
      quantity: 1,
      productAmountInCents: 1000,
      baseFeeInCents: 100,
      deliveryFeeInCents: 200,
      totalInCents: 1300,
      status: 'PENDING',
      externalTransactionId: null,
      paymentMethodType: 'CARD',
      cardBrand: null,
      cardLastFour: null,
      statusMessage: null,
      createdAt: now,
      updatedAt: now,
    };
    prismaMock.transaction.create.mockResolvedValue(record);
    prismaMock.transaction.findUnique.mockResolvedValue(record);
    prismaMock.transaction.update.mockResolvedValue({
      ...record,
      status: 'APPROVED',
    });

    const repo = new PrismaTransactionRepository(prismaMock as any);
    expect(
      (
        await repo.create({
          reference: 'TXN-1',
          productId: 'p1',
          customerId: 'c1',
          quantity: 1,
          productAmountInCents: 1000,
          baseFeeInCents: 100,
          deliveryFeeInCents: 200,
          totalInCents: 1300,
        })
      ).status,
    ).toBe('PENDING');
    expect((await repo.findById('t1'))?.id).toBe('t1');
    expect((await repo.findByReference('TXN-1'))?.reference).toBe('TXN-1');
    expect(
      (await repo.updateResult('t1', { status: 'APPROVED' })).status,
    ).toBe('APPROVED');
  });

  it('PrismaDeliveryRepository should create, find and update delivery status', async () => {
    const record = {
      id: 'd1',
      transactionId: 't1',
      customerId: 'c1',
      address: 'Calle 1',
      city: 'Montería',
      department: 'Córdoba',
      postalCode: null,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    prismaMock.delivery.create.mockResolvedValue(record);
    prismaMock.delivery.findUnique.mockResolvedValue(record);
    prismaMock.delivery.update.mockResolvedValue({
      ...record,
      status: 'ASSIGNED',
    });

    const repo = new PrismaDeliveryRepository(prismaMock as any);
    expect(
      (
        await repo.create({
          transactionId: 't1',
          customerId: 'c1',
          address: 'Calle 1',
          city: 'Montería',
          department: 'Córdoba',
        })
      ).id,
    ).toBe('d1');
    expect((await repo.findByTransactionId('t1'))?.id).toBe('d1');
    expect((await repo.updateStatus('t1', 'ASSIGNED')).status).toBe(
      'ASSIGNED',
    );
  });
});