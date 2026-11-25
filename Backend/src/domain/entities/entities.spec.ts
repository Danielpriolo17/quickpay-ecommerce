import { describe, expect, it } from '@jest/globals';
import { Customer } from './customer.entity';
import { Delivery } from './delivery.entity';
import { Product } from './product.entity';
import { Transaction } from './transaction.entity';

describe('Domain Entities', () => {
  const now = new Date('2026-01-01T00:00:00Z');

  it('Product should expose getters, check stock and compute subtotal', () => {
    const product = new Product({
      id: 'prod-1',
      name: 'Headphones',
      description: 'ANC',
      priceInCents: 100000,
      stock: 5,
      imageUrl: 'https://img.test/1.jpg',
      createdAt: now,
      updatedAt: now,
    });

    expect(product.id).toBe('prod-1');
    expect(product.name).toBe('Headphones');
    expect(product.description).toBe('ANC');
    expect(product.priceInCents).toBe(100000);
    expect(product.stock).toBe(5);
    expect(product.imageUrl).toBe('https://img.test/1.jpg');
    expect(product.createdAt).toBe(now);
    expect(product.updatedAt).toBe(now);
    expect(product.hasSufficientStock(3)).toBe(true);
    expect(product.hasSufficientStock(6)).toBe(false);
    expect(product.hasSufficientStock(0)).toBe(false);
    expect(product.calculateSubtotalInCents(2)).toBe(200000);
    expect(product.toJSON().id).toBe('prod-1');
  });

  it('Customer should expose getters and serialize cleanly', () => {
    const customer = new Customer({
      id: 'cust-1',
      fullName: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '+573001234567',
      createdAt: now,
      updatedAt: now,
    });

    expect(customer.id).toBe('cust-1');
    expect(customer.fullName).toBe('Juan Pérez');
    expect(customer.email).toBe('juan@test.com');
    expect(customer.phone).toBe('+573001234567');
    expect(customer.toJSON().email).toBe('juan@test.com');
  });

  it('Transaction should evaluate PENDING and APPROVED states', () => {
    const pendingTx = new Transaction({
      id: 'tx-1',
      reference: 'TXN-1',
      productId: 'prod-1',
      customerId: 'cust-1',
      quantity: 1,
      productAmountInCents: 100000,
      baseFeeInCents: 30000,
      deliveryFeeInCents: 50000,
      totalInCents: 180000,
      status: 'PENDING',
      externalTransactionId: null,
      paymentMethodType: 'CARD',
      createdAt: now,
      updatedAt: now,
    });

    expect(pendingTx.id).toBe('tx-1');
    expect(pendingTx.reference).toBe('TXN-1');
    expect(pendingTx.productId).toBe('prod-1');
    expect(pendingTx.customerId).toBe('cust-1');
    expect(pendingTx.quantity).toBe(1);
    expect(pendingTx.totalInCents).toBe(180000);
    expect(pendingTx.status).toBe('PENDING');
    expect(pendingTx.externalTransactionId).toBeNull();
    expect(pendingTx.isPending()).toBe(true);
    expect(pendingTx.isApproved()).toBe(false);
    expect(pendingTx.toJSON().reference).toBe('TXN-1');

    const approvedTx = new Transaction({
      ...pendingTx.toJSON(),
      status: 'APPROVED',
      externalTransactionId: 'ext-123',
    });
    expect(approvedTx.isPending()).toBe(false);
    expect(approvedTx.isApproved()).toBe(true);
    expect(approvedTx.externalTransactionId).toBe('ext-123');
  });

  it('Delivery should expose getters and serialize cleanly', () => {
    const delivery = new Delivery({
      id: 'del-1',
      transactionId: 'tx-1',
      customerId: 'cust-1',
      address: 'Calle 10 # 5-20',
      city: 'Montería',
      department: 'Córdoba',
      postalCode: '230001',
      status: 'ASSIGNED',
      createdAt: now,
      updatedAt: now,
    });

    expect(delivery.id).toBe('del-1');
    expect(delivery.transactionId).toBe('tx-1');
    expect(delivery.customerId).toBe('cust-1');
    expect(delivery.status).toBe('ASSIGNED');
    expect(delivery.toJSON().city).toBe('Montería');
  });
});