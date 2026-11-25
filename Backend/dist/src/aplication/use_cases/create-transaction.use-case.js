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
exports.CreateTransactionUseCase = void 0;
const common_1 = require("@nestjs/common");
const customer_repository_port_1 = require("../../domain/ports/customer.repository.port");
const delivery_repository_port_1 = require("../../domain/ports/delivery.repository.port");
const product_repository_port_1 = require("../../domain/ports/product.repository.port");
const transaction_repository_port_1 = require("../../domain/ports/transaction.repository.port");
const domain_error_1 = require("../../shared/errors/domain.error");
const result_1 = require("../../shared/rop/result");
const fee_config_1 = require("../config/fee.config");
function createUniqueId() {
    const cryptoApi = globalThis.crypto;
    return (cryptoApi?.randomUUID?.() ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
}
let CreateTransactionUseCase = class CreateTransactionUseCase {
    constructor(productRepository, customerRepository, transactionRepository, deliveryRepository, feeConfig) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
        this.deliveryRepository = deliveryRepository;
        this.feeConfig = feeConfig;
    }
    async execute(input) {
        const validatedQuantity = this.validateQuantity(input.quantity);
        const productResult = await validatedQuantity.flatMapAsync(() => this.findAndValidateProduct(input.productId, input.quantity));
        const customerResult = await productResult.flatMapAsync((product) => this.upsertCustomer(input.customer).then((res) => res.map((customer) => ({ product, customer }))));
        return customerResult.flatMapAsync(({ product, customer }) => this.persistPendingTransactionAndDelivery(product, customer, input));
    }
    validateQuantity(quantity) {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return (0, result_1.fail)(domain_error_1.DomainError.invalidQuantity());
        }
        return (0, result_1.ok)(quantity);
    }
    async findAndValidateProduct(productId, quantity) {
        try {
            const product = await this.productRepository.findById(productId);
            if (!product) {
                return (0, result_1.fail)(domain_error_1.DomainError.productNotFound(productId));
            }
            if (!product.hasSufficientStock(quantity)) {
                return (0, result_1.fail)(domain_error_1.DomainError.insufficientStock(product.stock, quantity));
            }
            return (0, result_1.ok)(product);
        }
        catch (error) {
            return (0, result_1.fail)(domain_error_1.DomainError.persistenceError(error instanceof Error ? error.message : 'Failed to validate product'));
        }
    }
    async upsertCustomer(customerInput) {
        try {
            const customer = await this.customerRepository.upsertByEmail({
                fullName: customerInput.fullName.trim(),
                email: customerInput.email.trim().toLowerCase(),
                phone: customerInput.phone.trim(),
            });
            return (0, result_1.ok)(customer);
        }
        catch (error) {
            return (0, result_1.fail)(domain_error_1.DomainError.persistenceError(error instanceof Error ? error.message : 'Failed to save customer'));
        }
    }
    async persistPendingTransactionAndDelivery(product, customer, input) {
        try {
            const productAmountInCents = product.calculateSubtotalInCents(input.quantity);
            const baseFeeInCents = this.feeConfig.baseFeeInCents;
            const deliveryFeeInCents = this.feeConfig.deliveryFeeInCents;
            const totalInCents = productAmountInCents + baseFeeInCents + deliveryFeeInCents;
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
            return (0, result_1.ok)({ transaction, customer, delivery, product });
        }
        catch (error) {
            return (0, result_1.fail)(domain_error_1.DomainError.persistenceError(error instanceof Error
                ? error.message
                : 'Failed to create pending transaction'));
        }
    }
};
exports.CreateTransactionUseCase = CreateTransactionUseCase;
exports.CreateTransactionUseCase = CreateTransactionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(product_repository_port_1.PRODUCT_REPOSITORY)),
    __param(1, (0, common_1.Inject)(customer_repository_port_1.CUSTOMER_REPOSITORY)),
    __param(2, (0, common_1.Inject)(transaction_repository_port_1.TRANSACTION_REPOSITORY)),
    __param(3, (0, common_1.Inject)(delivery_repository_port_1.DELIVERY_REPOSITORY)),
    __param(4, (0, common_1.Inject)(fee_config_1.FEE_CONFIG)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], CreateTransactionUseCase);
//# sourceMappingURL=create-transaction.use-case.js.map