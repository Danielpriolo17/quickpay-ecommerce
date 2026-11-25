"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fee_config_1 = require("./aplication/config/fee.config");
const create_transaction_use_case_1 = require("./aplication/use_cases/create-transaction.use-case");
const get_products_use_case_1 = require("./aplication/use_cases/get-products.use-case");
const get_transaction_use_case_1 = require("./aplication/use_cases/get-transaction.use-case");
const process_payment_use_case_1 = require("./aplication/use_cases/process-payment.use-case");
const customer_repository_port_1 = require("./domain/ports/customer.repository.port");
const delivery_repository_port_1 = require("./domain/ports/delivery.repository.port");
const payment_gateway_port_1 = require("./domain/ports/payment-gateway.port");
const product_repository_port_1 = require("./domain/ports/product.repository.port");
const transaction_repository_port_1 = require("./domain/ports/transaction.repository.port");
const health_controller_1 = require("./infra/http/controllers/health.controller");
const products_controller_1 = require("./infra/http/controllers/products.controller");
const transactions_controller_1 = require("./infra/http/controllers/transactions.controller");
const sandbox_payment_gateway_1 = require("./infra/gateway/sandbox-payment.gateway");
const prisma_customer_repository_1 = require("./infra/persistence/prisma-customer.repository");
const prisma_delivery_repository_1 = require("./infra/persistence/prisma-delivery.repository");
const prisma_product_repository_1 = require("./infra/persistence/prisma-product.repository");
const prisma_transaction_repository_1 = require("./infra/persistence/prisma-transaction.repository");
const prisma_service_1 = require("./infra/persistence/prisma.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
        ],
        controllers: [health_controller_1.HealthController, products_controller_1.ProductsController, transactions_controller_1.TransactionsController],
        providers: [
            prisma_service_1.PrismaService,
            {
                provide: product_repository_port_1.PRODUCT_REPOSITORY,
                useClass: prisma_product_repository_1.PrismaProductRepository,
            },
            {
                provide: customer_repository_port_1.CUSTOMER_REPOSITORY,
                useClass: prisma_customer_repository_1.PrismaCustomerRepository,
            },
            {
                provide: transaction_repository_port_1.TRANSACTION_REPOSITORY,
                useClass: prisma_transaction_repository_1.PrismaTransactionRepository,
            },
            {
                provide: delivery_repository_port_1.DELIVERY_REPOSITORY,
                useClass: prisma_delivery_repository_1.PrismaDeliveryRepository,
            },
            {
                provide: payment_gateway_port_1.PAYMENT_GATEWAY,
                useClass: sandbox_payment_gateway_1.SandboxPaymentGateway,
            },
            {
                provide: fee_config_1.FEE_CONFIG,
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    baseFeeInCents: Number(configService.get('BASE_FEE_IN_CENTS', 300000)),
                    deliveryFeeInCents: Number(configService.get('DELIVERY_FEE_IN_CENTS', 1000000)),
                }),
            },
            get_products_use_case_1.GetProductsUseCase,
            create_transaction_use_case_1.CreateTransactionUseCase,
            process_payment_use_case_1.ProcessPaymentUseCase,
            get_transaction_use_case_1.GetTransactionUseCase,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map