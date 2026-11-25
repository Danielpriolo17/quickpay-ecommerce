"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessPaymentUseCase = void 0;
const common_1 = require("@nestjs/common");
const customer_repository_port_1 = require("../../domain/ports/customer.repository.port");
const delivery_repository_port_1 = require("../../domain/ports/delivery.repository.port");
const payment_gateway_port_1 = require("../../domain/ports/payment-gateway.port");
const product_repository_port_1 = require("../../domain/ports/product.repository.port");
const transaction_repository_port_1 = require("../../domain/ports/transaction.repository.port");
const domain_error_1 = require("../../shared/errors/domain.error");
const result_1 = require("../../shared/rop/result");
let ProcessPaymentUseCase = class ProcessPaymentUseCase {
    constructor(transactionRepository, productRepository, customerRepository, deliveryRepository, paymentGateway) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.deliveryRepository = deliveryRepository;
        this.paymentGateway = paymentGateway;
    }
    async execute(input) {
        const contextResult = await this.loadAndValidateContext(input.transactionId);
        const gatewayResult = await contextResult.flatMapAsync((context) => this.chargeWithGateway(context, input).then((res) => res.map((gatewayResponse) => ({ context, gatewayResponse }))));
        return gatewayResult.flatMapAsync(({ context, gatewayResponse }) => this.finalizeOrder(context, gatewayResponse));
    }
    async loadAndValidateContext(transactionId) {
        try {
            const transaction = await this.transactionRepository.findById(transactionId);
            if (!transaction) {
                return (0, result_1.fail)(domain_error_1.DomainError.transactionNotFound(transactionId));
            }
            if (!transaction.isPending()) {
                return (0, result_1.fail)(domain_error_1.DomainError.transactionAlreadyProcessed(transaction.id, transaction.status));
            }
            const product = await this.productRepository.findById(transaction.productId);
            if (!product) {
                return (0, result_1.fail)(domain_error_1.DomainError.productNotFound(transaction.productId));
            }
            if (!product.hasSufficientStock(transaction.quantity)) {
                return (0, result_1.fail)(domain_error_1.DomainError.insufficientStock(product.stock, transaction.quantity));
            }
            const customer = await this.customerRepository.findById(transaction.customerId);
            if (!customer) {
                return (0, result_1.fail)(domain_error_1.DomainError.persistenceError(`Customer ${transaction.customerId} not found`));
            }
            return (0, result_1.ok)({ transaction, product, customer });
        }
        catch (error) {
            return (0, result_1.fail)(domain_error_1.DomainError.persistenceError(error instanceof Error
                ? error.message
                : 'Failed to load payment context'));
        }
    }
    async chargeWithGateway(context, input) {
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
    async finalizeOrder(context, gatewayResponse) {
        try {
            const updatedTransaction = await this.transactionRepository.updateResult(context.transaction.id, {
                status: gatewayResponse.status,
                externalTransactionId: gatewayResponse.externalTransactionId,
                cardBrand: gatewayResponse.cardBrand,
                cardLastFour: gatewayResponse.cardLastFour,
                statusMessage: gatewayResponse.statusMessage,
            });
            if (updatedTransaction.isApproved()) {
                const updatedProduct = await this.productRepository.decrementStock(context.product.id, context.transaction.quantity);
                const assignedDelivery = await this.deliveryRepository.updateStatus(updatedTransaction.id, 'ASSIGNED');
                return (0, result_1.ok)({
                    transaction: updatedTransaction,
                    delivery: assignedDelivery,
                    product: updatedProduct,
                });
            }
            const cancelledDelivery = await this.deliveryRepository.updateStatus(updatedTransaction.id, 'CANCELLED');
            return (0, result_1.ok)({
                transaction: updatedTransaction,
                delivery: cancelledDelivery,
                product: context.product,
            });
        }
        catch (error) {
            return (0, result_1.fail)(domain_error_1.DomainError.persistenceError(error instanceof Error
                ? error.message
                : 'Failed to finalize transaction'));
        }
    }
};
exports.ProcessPaymentUseCase = ProcessPaymentUseCase;
exports.ProcessPaymentUseCase = ProcessPaymentUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(transaction_repository_port_1.TRANSACTION_REPOSITORY)),
    __param(1, (0, common_1.Inject)(product_repository_port_1.PRODUCT_REPOSITORY)),
    __param(2, (0, common_1.Inject)(customer_repository_port_1.CUSTOMER_REPOSITORY)),
    __param(3, (0, common_1.Inject)(delivery_repository_port_1.DELIVERY_REPOSITORY)),
    __param(4, (0, common_1.Inject)(payment_gateway_port_1.PAYMENT_GATEWAY)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ProcessPaymentUseCase);
//# sourceMappingURL=process-payment.use-case.js.map