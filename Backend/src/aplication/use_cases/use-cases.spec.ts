import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Customer } from '../../domain/entities/customer.entity';
import { Delivery } from '../../domain/entities/delivery.entity';
import { Product } from '../../domain/entities/product.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { CustomerRepositoryPort } from '../../domain/ports/customer.repository.port';
import { DeliveryRepositoryPort } from '../../domain/ports/delivery.repository.port';
import { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { DomainError } from '../../shared/errors/domain.error';
import { fail, ok } from '../../shared/rop/result';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { GetProductsUseCase } from './get-products.use-case';
import { GetTransactionUseCase } from './get-transaction.use-case';
import { ProcessPaymentUseCase } from './process-payment.use-case';

describe('Application Use Cases (ROP)', () => {
  const now = new Date();
  const sampleProduct = new Product({
    id: 'prod-1',
    name: 'Keyboard',
    description: 'Mechanical',
    priceInCents: 20000000,
    stock: 10,
    imageUrl: 'https://img.test/k.jpg',
    createdAt: now,
    updatedAt: now,
  });

  const sampleCustomer = new Customer({
    id: 'cust-1',
    fullName: 'Ana Gómez',
    email: 'ana@test.com',
    phone: '+573001112233',
    createdAt: now,
    updatedAt: now,
  });

  const samplePendingTx = new Transaction({
    id: 'tx-1',
    reference: 'TXN-123',
    productId: 'prod-1',
    customerId: 'cust-1',
    quantity: 2,
    productAmountInCents: 40000000,
    baseFeeInCents: 300000,
    deliveryFeeInCents: 1000000,
    totalInCents: 41300000,
    status: 'PENDING',
    paymentMethodType: 'CARD',
    createdAt: now,
    updatedAt: now,
  });

  const sampleDelivery = new Delivery({
    id: 'del-1',
    transactionId: 'tx-1',
    customerId: 'cust-1',
    address: 'Cra 1 # 2-3',
    city: 'Montería',
    department: 'Córdoba',
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  });

  let productRepo: jest.Mocked<ProductRepositoryPort>;
  let customerRepo: jest.Mocked<CustomerRepositoryPort>;
  let transactionRepo: jest.Mocked<TransactionRepositoryPort>;
  let deliveryRepo: jest.Mocked<DeliveryRepositoryPort>;
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;

  beforeEach(() => {
    productRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      decrementStock: jest.fn(),
    };
    customerRepo = {
      upsertByEmail: jest.fn(),
      findById: jest.fn(),
    };
    transactionRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByReference: jest.fn(),
      updateResult: jest.fn(),
    };
    deliveryRepo = {
      create: jest.fn(),
      findByTransactionId: jest.fn(),
      updateStatus: jest.fn(),
    };
    paymentGateway = {
      processCardPayment: jest.fn(),
    };
  });

  describe('GetProductsUseCase', () => {
    it('should return all products', async () => {
      productRepo.findAll.mockResolvedValue([sampleProduct]);
      const useCase = new GetProductsUseCase(productRepo);

      const result = await useCase.executeAll();
      expect(result.isOk).toBe(true);
      if (result.isOk) expect(result.value).toHaveLength(1);
    });

    it('should return persistence error if findAll throws', async () => {
      productRepo.findAll.mockRejectedValue(new Error('DB down'));
      const useCase = new GetProductsUseCase(productRepo);

      const result = await useCase.executeAll();
      expect(result.isFail).toBe(true);
      if (result.isFail) expect(result.error.code).toBe('PERSISTENCE_ERROR');
    });

    it('should return product by id or PRODUCT_NOT_FOUND', async () => {
      productRepo.findById.mockResolvedValueOnce(sampleProduct);
      productRepo.findById.mockResolvedValueOnce(null);
      const useCase = new GetProductsUseCase(productRepo);

      const found = await useCase.executeById('prod-1');
      expect(found.isOk).toBe(true);

      const notFound = await useCase.executeById('missing');
      expect(notFound.isFail).toBe(true);
      if (notFound.isFail) expect(notFound.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('CreateTransactionUseCase', () => {
    const validInput = {
      productId: 'prod-1',
      quantity: 2,
      customer: {
        fullName: ' Ana Gómez ',
        email: 'ANA@TEST.COM ',
        phone: '+573001112233',
      },
      delivery: {
        address: 'Cra 1 # 2-3',
        city: 'Montería',
        department: 'Córdoba',
      },
    };

    it('should create PENDING transaction with server-calculated fees', async () => {
      productRepo.findById.mockResolvedValue(sampleProduct);
      customerRepo.upsertByEmail.mockResolvedValue(sampleCustomer);
      transactionRepo.create.mockResolvedValue(samplePendingTx);
      deliveryRepo.create.mockResolvedValue(sampleDelivery);

      const useCase = new CreateTransactionUseCase(
        productRepo,
        customerRepo,
        transactionRepo,
        deliveryRepo,
        { baseFeeInCents: 300000, deliveryFeeInCents: 1000000 },
      );

      const result = await useCase.execute(validInput);
      expect(result.isOk).toBe(true);
      expect(transactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productAmountInCents: 40000000,
          baseFeeInCents: 300000,
          deliveryFeeInCents: 1000000,
          totalInCents: 41300000,
        }),
      );
    });

    it('should fail with INVALID_QUANTITY when quantity <= 0', async () => {
      const useCase = new CreateTransactionUseCase(
        productRepo,
        customerRepo,
        transactionRepo,
        deliveryRepo,
        { baseFeeInCents: 300000, deliveryFeeInCents: 1000000 },
      );

      const result = await useCase.execute({ ...validInput, quantity: 0 });
      expect(result.isFail).toBe(true);
      if (result.isFail) expect(result.error.code).toBe('INVALID_QUANTITY');
    });

    it('should fail with INSUFFICIENT_STOCK when requested exceeds stock', async () => {
      productRepo.findById.mockResolvedValue(sampleProduct);
      const useCase = new CreateTransactionUseCase(
        productRepo,
        customerRepo,
        transactionRepo,
        deliveryRepo,
        { baseFeeInCents: 300000, deliveryFeeInCents: 1000000 },
      );

      const result = await useCase.execute({ ...validInput, quantity: 99 });
      expect(result.isFail).toBe(true);
      if (result.isFail) expect(result.error.code).toBe('INSUFFICIENT_STOCK');
    });

    it('should fail with PRODUCT_NOT_FOUND when product does not exist', async () => {
      productRepo.findById.mockResolvedValue(null);
      const useCase = new CreateTransactionUseCase(
        productRepo,
        customerRepo,
        transactionRepo,
        deliveryRepo,
        { baseFeeInCents: 300000, deliveryFeeInCents: 1000000 },
      );

      const result = await useCase.execute(validInput);
      expect(result.isFail).toBe(true);
      if (result.isFail) expect(result.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('ProcessPaymentUseCase', () => {
    const paymentInput = {
      transactionId: 'tx-1',
      installments: 1,
      card: {
        number: '4242424242424242',
        cvc: '123',
        expMonth: '08',
        expYear: '29',
        cardHolder: 'ANA GOMEZ',
      },
    };

    it('should approve transaction, decrement stock and assign delivery', async () => {
      const approvedTx = new Transaction({
        ...samplePendingTx.toJSON(),
        status: 'APPROVED',
        externalTransactionId: 'ext-1',
      });
      const updatedProduct = new Product({
        ...sampleProduct.toJSON(),
        stock: 8,
      });
      const assignedDelivery = new Delivery({
        ...sampleDelivery.toJSON(),
        status: 'ASSIGNED',
      });

      transactionRepo.findById.mockResolvedValue(samplePendingTx);
      productRepo.findById.mockResolvedValue(sampleProduct);
      customerRepo.findById.mockResolvedValue(sampleCustomer);
      paymentGateway.processCardPayment.mockResolvedValue(
        ok({
          externalTransactionId: 'ext-1',
          status: 'APPROVED',
          cardBrand: 'VISA',
          cardLastFour: '4242',
        }),
      );
      transactionRepo.updateResult.mockResolvedValue(approvedTx);
      productRepo.decrementStock.mockResolvedValue(updatedProduct);
      deliveryRepo.updateStatus.mockResolvedValue(assignedDelivery);

      const useCase = new ProcessPaymentUseCase(
        transactionRepo,
        productRepo,
        customerRepo,
        deliveryRepo,
        paymentGateway,
      );

      const result = await useCase.execute(paymentInput);
      expect(result.isOk).toBe(true);
      expect(productRepo.decrementStock).toHaveBeenCalledWith('prod-1', 2);
      expect(deliveryRepo.updateStatus).toHaveBeenCalledWith('tx-1', 'ASSIGNED');
    });

    it('should cancel delivery and keep stock untouched when DECLINED', async () => {
      const declinedTx = new Transaction({
        ...samplePendingTx.toJSON(),
        status: 'DECLINED',
      });
      const cancelledDelivery = new Delivery({
        ...sampleDelivery.toJSON(),
        status: 'CANCELLED',
      });

      transactionRepo.findById.mockResolvedValue(samplePendingTx);
      productRepo.findById.mockResolvedValue(sampleProduct);
      customerRepo.findById.mockResolvedValue(sampleCustomer);
      paymentGateway.processCardPayment.mockResolvedValue(
        ok({
          externalTransactionId: 'ext-2',
          status: 'DECLINED',
          statusMessage: 'Insufficient funds',
        }),
      );
      transactionRepo.updateResult.mockResolvedValue(declinedTx);
      deliveryRepo.updateStatus.mockResolvedValue(cancelledDelivery);

      const useCase = new ProcessPaymentUseCase(
        transactionRepo,
        productRepo,
        customerRepo,
        deliveryRepo,
        paymentGateway,
      );

      const result = await useCase.execute(paymentInput);
      expect(result.isOk).toBe(true);
      expect(productRepo.decrementStock).not.toHaveBeenCalled();
      expect(deliveryRepo.updateStatus).toHaveBeenCalledWith(
        'tx-1',
        'CANCELLED',
      );
    });

    it('should mark transaction as ERROR when payment gateway fails', async () => {
      transactionRepo.findById.mockResolvedValue(samplePendingTx);
      productRepo.findById.mockResolvedValue(sampleProduct);
      customerRepo.findById.mockResolvedValue(sampleCustomer);
      paymentGateway.processCardPayment.mockResolvedValue(
        fail(DomainError.paymentGatewayError('Gateway timeout')),
      );
      transactionRepo.updateResult.mockResolvedValue(samplePendingTx);
      deliveryRepo.updateStatus.mockResolvedValue(sampleDelivery);

      const useCase = new ProcessPaymentUseCase(
        transactionRepo,
        productRepo,
        customerRepo,
        deliveryRepo,
        paymentGateway,
      );

      const result = await useCase.execute(paymentInput);
      expect(result.isFail).toBe(true);
      expect(transactionRepo.updateResult).toHaveBeenCalledWith(
        'tx-1',
        expect.objectContaining({ status: 'ERROR' }),
      );
    });

    it('should reject if transaction is not PENDING', async () => {
      transactionRepo.findById.mockResolvedValue(
        new Transaction({ ...samplePendingTx.toJSON(), status: 'APPROVED' }),
      );
      const useCase = new ProcessPaymentUseCase(
        transactionRepo,
        productRepo,
        customerRepo,
        deliveryRepo,
        paymentGateway,
      );

      const result = await useCase.execute(paymentInput);
      expect(result.isFail).toBe(true);
      if (result.isFail) {
        expect(result.error.code).toBe('TRANSACTION_ALREADY_PROCESSED');
      }
    });

    it('should reject if transaction is not found', async () => {
      transactionRepo.findById.mockResolvedValue(null);
      const useCase = new ProcessPaymentUseCase(
        transactionRepo,
        productRepo,
        customerRepo,
        deliveryRepo,
        paymentGateway,
      );

      const result = await useCase.execute(paymentInput);
      expect(result.isFail).toBe(true);
      if (result.isFail) {
        expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
      }
    });
  });

  describe('GetTransactionUseCase', () => {
    it('should return transaction and delivery', async () => {
      transactionRepo.findById.mockResolvedValue(samplePendingTx);
      deliveryRepo.findByTransactionId.mockResolvedValue(sampleDelivery);
      const useCase = new GetTransactionUseCase(transactionRepo, deliveryRepo);

      const result = await useCase.execute('tx-1');
      expect(result.isOk).toBe(true);
    });

    it('should return TRANSACTION_NOT_FOUND when missing', async () => {
      transactionRepo.findById.mockResolvedValue(null);
      const useCase = new GetTransactionUseCase(transactionRepo, deliveryRepo);

      const result = await useCase.execute('missing');
      expect(result.isFail).toBe(true);
      if (result.isFail) {
        expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
      }
    });
  });
});