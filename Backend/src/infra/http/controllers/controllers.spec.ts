import { describe, expect, it, jest } from '@jest/globals';
import { HttpException } from '@nestjs/common';
import { Customer } from '../../../domain/entities/customer.entity';
import { Delivery } from '../../../domain/entities/delivery.entity';
import { Product } from '../../../domain/entities/product.entity';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { DomainError } from '../../../shared/errors/domain.error';
import { fail, ok, type Result } from '../../../shared/rop/result';
import { unwrapOrThrowHttp } from '../helpers/result-to-http.helper';
import { HealthController } from './health.controller';
import { ProductsController } from './products.controller';
import { TransactionsController } from './transactions.controller';

describe('HTTP Controllers & Helper', () => {
  const now = new Date();
  const product = new Product({
    id: 'p1',
    name: 'Watch',
    description: 'Smart',
    priceInCents: 100000,
    stock: 4,
    imageUrl: 'https://img.test/w.jpg',
    createdAt: now,
    updatedAt: now,
  });
  const customer = new Customer({
    id: 'c1',
    fullName: 'Luis',
    email: 'luis@test.com',
    phone: '+573001112233',
    createdAt: now,
    updatedAt: now,
  });
  const transaction = new Transaction({
    id: 't1',
    reference: 'TXN-1',
    productId: 'p1',
    customerId: 'c1',
    quantity: 1,
    productAmountInCents: 100000,
    baseFeeInCents: 30000,
    deliveryFeeInCents: 50000,
    totalInCents: 180000,
    status: 'PENDING',
    paymentMethodType: 'CARD',
    createdAt: now,
    updatedAt: now,
  });
  const delivery = new Delivery({
    id: 'd1',
    transactionId: 't1',
    customerId: 'c1',
    address: 'Calle 1',
    city: 'Montería',
    department: 'Córdoba',
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  });

  it('unwrapOrThrowHttp should return value on Ok and throw HttpException on Fail', () => {
    expect(unwrapOrThrowHttp(ok('success'))).toBe('success');
    expect(() =>
      unwrapOrThrowHttp(fail(DomainError.productNotFound('p1'))),
    ).toThrow(HttpException);
  });

  it('HealthController should return ok status', () => {
    const controller = new HealthController();
    const response = controller.check();
    expect(response.status).toBe('ok');
    expect(response.timestamp).toBeDefined();
  });

  it('ProductsController should list and fetch by id', async () => {
    const useCase = {
      executeAll: jest
        .fn<() => Promise<Result<Product[], never>>>()
        .mockResolvedValue(ok([product])),
      executeById: jest
        .fn<() => Promise<Result<Product, never>>>()
        .mockResolvedValue(ok(product)),
    };
    const controller = new ProductsController(useCase as any);

    const list = await controller.findAll();
    expect(list.data).toHaveLength(1);

    const single = await controller.findById('p1');
    expect(single.data.id).toBe('p1');
  });

  it('TransactionsController should create, pay and fetch by id', async () => {
    const createUseCase = {
      execute: jest
        .fn<
          () => Promise<
            Result<
              {
                transaction: Transaction;
                customer: Customer;
                delivery: Delivery;
                product: Product;
              },
              never
            >
          >
        >()
        .mockResolvedValue(ok({ transaction, customer, delivery, product })),
    };
    const payUseCase = {
      execute: jest
        .fn<
          () => Promise<
            Result<{ transaction: Transaction; delivery: Delivery; product: Product }, never>
          >
        >()
        .mockResolvedValue(ok({ transaction, delivery, product })),
    };
    const getUseCase = {
      execute: jest
        .fn<
          () => Promise<
            Result<{ transaction: Transaction; delivery: Delivery }, never>
          >
        >()
        .mockResolvedValue(ok({ transaction, delivery })),
    };

    const controller = new TransactionsController(
      createUseCase as any,
      payUseCase as any,
      getUseCase as any,
    );

    const created = await controller.create({} as any);
    expect(created.data.transaction.id).toBe('t1');

    const paid = await controller.processPayment('t1', {
      installments: 1,
      card: {} as any,
    });
    expect(paid.data.product.id).toBe('p1');

    const fetched = await controller.findById('t1');
    expect(fetched.data.delivery?.id).toBe('d1');
  });
});