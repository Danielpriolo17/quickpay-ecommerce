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
  CardDataInput,
  PAYMENT_GATEWAY,
  PaymentGatewayPort,
  PaymentGatewayResult,
} from '../../domain/ports/payment-gateway.port';
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

export interface ProcessPaymentInput {
  transactionId: string;
  installments: number;
  card: CardDataInput;
}

export interface ProcessPaymentOutput {
  transaction: Transaction;
  delivery: Delivery;
  product: Product;
}

interface LoadedPaymentContext {
  transaction: Transaction;
  product: Product;
  customer: Customer;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(
    input: ProcessPaymentInput,
  ): Promise<Result<ProcessPaymentOutput, DomainError>> {
    const contextResult = await this.loadAndValidateContext(
      input.transactionId,
    );

    const gatewayResult = await contextResult.flatMapAsync((context) =>
      this.chargeWithGateway(context, input).then((res) =>
        res.map((gatewayResponse) => ({ context, gatewayResponse })),
      ),
    );

    return gatewayResult.flatMapAsync(({ context, gatewayResponse }) =>
      this.finalizeOrder(context, gatewayResponse),
    );
  }

  private async loadAndValidateContext(
    transactionId: string,
  ): Promise<Result<LoadedPaymentContext, DomainError>> {
    try {
      const transaction =
        await this.transactionRepository.findById(transactionId);
      if (!transaction) {
        return fail(DomainError.transactionNotFound(transactionId));
      }

      if (!transaction.isPending()) {
        return fail(
          DomainError.transactionAlreadyProcessed(
            transaction.id,
            transaction.status,
          ),
        );
      }

      const product = await this.productRepository.findById(
        transaction.productId,
      );
      if (!product) {
        return fail(DomainError.productNotFound(transaction.productId));
      }

      if (!product.hasSufficientStock(transaction.quantity)) {
        return fail(
          DomainError.insufficientStock(product.stock, transaction.quantity),
        );
      }

      const customer = await this.customerRepository.findById(
        transaction.customerId,
      );
      if (!customer) {
        return fail(
          DomainError.persistenceError(
            `Customer ${transaction.customerId} not found`,
          ),
        );
      }

      return ok({ transaction, product, customer });
    } catch (error) {
      return fail(
        DomainError.persistenceError(
          error instanceof Error
            ? error.message
            : 'Failed to load payment context',
        ),
      );
    }
  }

  private async chargeWithGateway(
    context: LoadedPaymentContext,
    input: ProcessPaymentInput,
  ): Promise<Result<PaymentGatewayResult, DomainError>> {
    const paymentResult = await this.paymentGateway.processCardPayment({
      reference: context.transaction.reference,
      amountInCents: context.transaction.totalInCents,
      currency: 'COP',
      customerEmail: context.customer.email,
      installments: input.installments,
      card: input.card,
    });

    if (paymentResult.isFail) {
      await this.transactionRepository
        .updateResult(context.transaction.id, {
          status: 'ERROR',
          statusMessage: paymentResult.error.message,
        })
        .catch(() => undefined);

      await this.deliveryRepository
        .updateStatus(context.transaction.id, 'CANCELLED')
        .catch(() => undefined);
    }

    return paymentResult;
  }

  private async finalizeOrder(
    context: LoadedPaymentContext,
    gatewayResponse: PaymentGatewayResult,
  ): Promise<Result<ProcessPaymentOutput, DomainError>> {
    try {
      const updatedTransaction = await this.transactionRepository.updateResult(
        context.transaction.id,
        {
          status: gatewayResponse.status,
          externalTransactionId: gatewayResponse.externalTransactionId,
          cardBrand: gatewayResponse.cardBrand,
          cardLastFour: gatewayResponse.cardLastFour,
          statusMessage: gatewayResponse.statusMessage,
        },
      );

      if (updatedTransaction.isApproved()) {
        const updatedProduct = await this.productRepository.decrementStock(
          context.product.id,
          context.transaction.quantity,
        );
        const assignedDelivery = await this.deliveryRepository.updateStatus(
          updatedTransaction.id,
          'ASSIGNED',
        );

        return ok({
          transaction: updatedTransaction,
          delivery: assignedDelivery,
          product: updatedProduct,
        });
      }

      const cancelledDelivery = await this.deliveryRepository.updateStatus(
        updatedTransaction.id,
        'CANCELLED',
      );

      return ok({
        transaction: updatedTransaction,
        delivery: cancelledDelivery,
        product: context.product,
      });
    } catch (error) {
      return fail(
        DomainError.persistenceError(
          error instanceof Error
            ? error.message
            : 'Failed to finalize transaction',
        ),
      );
    }
  }
}