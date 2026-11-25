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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_transaction_use_case_1 = require("../../../aplication/use_cases/create-transaction.use-case");
const get_transaction_use_case_1 = require("../../../aplication/use_cases/get-transaction.use-case");
const process_payment_use_case_1 = require("../../../aplication/use_cases/process-payment.use-case");
const create_transaction_dto_1 = require("../dtos/create-transaction.dto");
const process_payment_dto_1 = require("../dtos/process-payment.dto");
const result_to_http_helper_1 = require("../helpers/result-to-http.helper");
let TransactionsController = class TransactionsController {
    constructor(createTransactionUseCase, processPaymentUseCase, getTransactionUseCase) {
        this.createTransactionUseCase = createTransactionUseCase;
        this.processPaymentUseCase = processPaymentUseCase;
        this.getTransactionUseCase = getTransactionUseCase;
    }
    async create(dto) {
        const result = (0, result_to_http_helper_1.unwrapOrThrowHttp)(await this.createTransactionUseCase.execute(dto));
        return {
            data: {
                transaction: result.transaction.toJSON(),
                customer: result.customer.toJSON(),
                delivery: result.delivery.toJSON(),
                product: result.product.toJSON(),
            },
        };
    }
    async processPayment(id, dto) {
        const result = (0, result_to_http_helper_1.unwrapOrThrowHttp)(await this.processPaymentUseCase.execute({
            transactionId: id,
            installments: dto.installments,
            card: dto.card,
        }));
        return {
            data: {
                transaction: result.transaction.toJSON(),
                delivery: result.delivery.toJSON(),
                product: result.product.toJSON(),
            },
        };
    }
    async findById(id) {
        const result = (0, result_to_http_helper_1.unwrapOrThrowHttp)(await this.getTransactionUseCase.execute(id));
        return {
            data: {
                transaction: result.transaction.toJSON(),
                delivery: result.delivery ? result.delivery.toJSON() : null,
            },
        };
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a PENDING transaction along with customer and delivery',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transaction created in PENDING' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Insufficient stock' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Process credit card payment in Sandbox gateway and update stock/delivery',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment processed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Transaction already processed' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, process_payment_dto_1.ProcessPaymentDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "processPayment", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction and delivery status by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "findById", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [create_transaction_use_case_1.CreateTransactionUseCase,
        process_payment_use_case_1.ProcessPaymentUseCase,
        get_transaction_use_case_1.GetTransactionUseCase])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map