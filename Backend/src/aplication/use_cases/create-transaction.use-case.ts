import { Inject, Injectable } from '@nestjs/common';
import { Customer } from '../../domain/entities/customer.entity';
import { Delivery } from '../../domain/entities/delivery.entity';
import { Product } from '../../domain/entities/product.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepositoryPort,
} from '../../domain/ports/customer.repository.port';
import {
  DELIVERY_REPOSITORY,
  DeliveryRepositoryPort,
} from '../../domain/ports/delivery.repository.port';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from '../../domain/ports/product.repository.port';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '../../domain/ports/transaction.repository.port';
import { DomainError } from '../../shared/errors/domain.error';
import { fail, ok, Result } from '../../shared/rop/result';
import { FEE_CONFIG, FeeConfig } from '../config/fee.config';

function createUniqueId(): string {
  const cryptoApi = (globalThis as unknown as {
    crypto?: { randomUUID?: () => string };
  }).crypto;

  return (
    cryptoApi?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}

export interface CreateTransactionInput {
  productId: string;
  quantity: number;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  delivery: {
    address: string;
    city: string;
    department: string;
    postalCode?: string;
  };
}

export interface CreateTransactionOutput {
  transaction: Transaction;
  customer: Customer;
  delivery: Delivery;
  product: Product;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
    @Inject(FEE_CONFIG)
    private readonly feeConfig: FeeConfig,
  ) {}

  async execute(
    input: CreateTransactionInput,
  ): Promise<Result<CreateTransactionOutput, DomainError>> {
    const validatedQuantity = this.validateQuantity(input.quantity);

    const productResult = await validatedQuantity.flatMapAsync(() =>
      this.findAndValidateProduct(input.productId, input.quantity),
    );

    const customerResult = await productResult.flatMapAsync((product) =>
      this.upsertCustomer(input.customer).then((res) =>
        res.map((customer) => ({ product, customer })),
      ),
    );

    return customerResult.flatMapAsync(({ product, customer }) =>
      this.persistPendingTransactionAndDelivery(product, customer, input),
    );
  }

  private validateQuantity(quantity: number): Result<number, DomainError> {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return fail(DomainError.invalidQuantity());
    }
    return ok(quantity);
  }

  private async findAndValidateProduct(
    productId: string,
    quantity: number,
  ): Promise<Result<Product, DomainError>> {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        return fail(DomainError.productNotFound(productId));
      }
      if (!product.hasSufficientStock(quantity)) {
        return fail(DomainError.insufficientStock(product.stock, quantity));
      }
      return ok(product);
    } catch (error) {
      return fail(
        DomainError.persistenceError(
          error instanceof Error ? error.message : 'Failed to validate product',
        ),
      );
    }
  }

  private async upsertCustomer(
    customerInput: CreateTransactionInput['customer'],
  ): Promise<Result<Customer, DomainError>> {
    try {
      const customer = await this.customerRepository.upsertByEmail({
        fullName: customerInput.fullName.trim(),
        email: customerInput.email.trim().toLowerCase(),
        phone: customerInput.phone.trim(),
      });
      return ok(customer);
    } catch (error) {
      return fail(
        DomainError.persistenceError(
          error instanceof Error ? error.message : 'Failed to save customer',
        ),
      );
    }
  }

  private async persistPendingTransactionAndDelivery(
    product: Product,
    customer: Customer,
    input: CreateTransactionInput,
  ): Promise<Result<CreateTransactionOutput, DomainError>> {
    try {
      const productAmountInCents = product.calculateSubtotalInCents(
        input.quantity,
      );
      const baseFeeInCents = this.feeConfig.baseFeeInCents;
      const deliveryFeeInCents = this.feeConfig.deliveryFeeInCents;
      const totalInCents =
        productAmountInCents + baseFeeInCents + deliveryFeeInCents;

      const reference = `TXN-${Date.now()}-${createUniqueId().slice(0, 8).toUpperCase()}`;

      const transaction = await this.transactionRepository.create({
        reference,
        productId: product.id,
        customerId: customer.id,
        quantity: input.quantity,
        productAmountInCents,
        baseFeeInCents,
        deliveryFeeInCents,
        totalInCents,
      });

      const delivery = await this.deliveryRepository.create({
        transactionId: transaction.id,
        customerId: customer.id,
        address: input.delivery.address.trim(),
        city: input.delivery.city.trim(),
        department: input.delivery.department.trim(),
        postalCode: input.delivery.postalCode?.trim(),
      });

      return ok({ transaction, customer, delivery, product });
    } catch (error) {
      return fail(
        DomainError.persistenceError(
          error instanceof Error
            ? error.message
            : 'Failed to create pending transaction',
        ),
      );
    }
  }
}