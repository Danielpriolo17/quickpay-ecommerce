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
exports.GetTransactionUseCase = void 0;
const common_1 = require("@nestjs/common");
const delivery_repository_port_1 = require("../../domain/ports/delivery.repository.port");
const transaction_repository_port_1 = require("../../domain/ports/transaction.repository.port");
const domain_error_1 = require("../../shared/errors/domain.error");
const result_1 = require("../../shared/rop/result");
let GetTransactionUseCase = class GetTransactionUseCase {
    constructor(transactionRepository, deliveryRepository) {
        this.transactionRepository = transactionRepository;
        this.deliveryRepository = deliveryRepository;
    }
    async execute(transactionId) {
        try {
            const transaction = await this.transactionRepository.findById(transactionId);
            if (!transaction) {
                return (0, result_1.fail)(domain_error_1.DomainError.transactionNotFound(transactionId));
            }
            const delivery = await this.deliveryRepository.findByTransactionId(transaction.id);
            return (0, result_1.ok)({ transaction, delivery });
        }
        catch (error) {
            return (0, result_1.fail)(domain_error_1.DomainError.persistenceError(error instanceof Error
                ? error.message
                : 'Failed to fetch transaction'));
        }
    }
};
exports.GetTransactionUseCase = GetTransactionUseCase;
exports.GetTransactionUseCase = GetTransactionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(transaction_repository_port_1.TRANSACTION_REPOSITORY)),
    __param(1, (0, common_1.Inject)(delivery_repository_port_1.DELIVERY_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], GetTransactionUseCase);
//# sourceMappingURL=get-transaction.use-case.js.map