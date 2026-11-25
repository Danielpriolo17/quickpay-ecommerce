import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FEE_CONFIG, FeeConfig } from './aplication/config/fee.config';
import { CreateTransactionUseCase } from './aplication/use_cases/create-transaction.use-case';
import { GetProductsUseCase } from './aplication/use_cases/get-products.use-case';
import { GetTransactionUseCase } from './aplication/use_cases/get-transaction.use-case';
import { ProcessPaymentUseCase } from './aplication/use_cases/process-payment.use-case';
import { CUSTOMER_REPOSITORY } from './domain/ports/customer.repository.port';
import { DELIVERY_REPOSITORY } from './domain/ports/delivery.repository.port';
import { PAYMENT_GATEWAY } from './domain/ports/payment-gateway.port';
import { PRODUCT_REPOSITORY } from './domain/ports/product.repository.port';
import { TRANSACTION_REPOSITORY } from './domain/ports/transaction.repository.port';
import { HealthController } from './infra/http/controllers/health.controller';
import { ProductsController } from './infra/http/controllers/products.controller';
import { TransactionsController } from './infra/http/controllers/transactions.controller';
import { SandboxPaymentGateway } from './infra/gateway/sandbox-payment.gateway';
import { PrismaCustomerRepository } from './infra/persistence/prisma-customer.repository';
import { PrismaDeliveryRepository } from './infra/persistence/prisma-delivery.repository';
import { PrismaProductRepository } from './infra/persistence/prisma-product.repository';
import { PrismaTransactionRepository } from './infra/persistence/prisma-transaction.repository';
import { PrismaService } from './infra/persistence/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [HealthController, ProductsController, TransactionsController],
  providers: [
    PrismaService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: PrismaTransactionRepository,
    },
    {
      provide: DELIVERY_REPOSITORY,
      useClass: PrismaDeliveryRepository,
    },
    {
      provide: PAYMENT_GATEWAY,
      useClass: SandboxPaymentGateway,
    },
    {
      provide: FEE_CONFIG,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): FeeConfig => ({
        baseFeeInCents: Number(configService.get('BASE_FEE_IN_CENTS', 300000)),
        deliveryFeeInCents: Number(
          configService.get('DELIVERY_FEE_IN_CENTS', 1000000),
        ),
      }),
    },
    GetProductsUseCase,
    CreateTransactionUseCase,
    ProcessPaymentUseCase,
    GetTransactionUseCase,
  ],
})
export class AppModule {}