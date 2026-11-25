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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTransactionRepository = void 0;
const common_1 = require("@nestjs/common");
const transaction_entity_1 = require("../../domain/entities/transaction.entity");
const prisma_service_1 = require("./prisma.service");
let PrismaTransactionRepository = class PrismaTransactionRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const record = await this.prisma.transaction.create({
            data: {
                reference: data.reference,
                productId: data.productId,
                customerId: data.customerId,
                quantity: data.quantity,
                productAmountInCents: data.productAmountInCents,
                baseFeeInCents: data.baseFeeInCents,
                deliveryFeeInCents: data.deliveryFeeInCents,
                totalInCents: data.totalInCents,
                status: 'PENDING',
            },
        });
        return this.toDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.transaction.findUnique({ where: { id } });
        return record ? this.toDomain(record) : null;
    }
    async findByReference(reference) {
        const record = await this.prisma.transaction.findUnique({
            where: { reference },
        });
        return record ? this.toDomain(record) : null;
    }
    async updateResult(id, data) {
        const updated = await this.prisma.transaction.update({
            where: { id },
            data: {
                status: data.status,
                externalTransactionId: data.externalTransactionId,
                cardBrand: data.cardBrand,
                cardLastFour: data.cardLastFour,
                statusMessage: data.statusMessage,
            },
        });
        return this.toDomain(updated);
    }
    toDomain(record) {
        return new transaction_entity_1.Transaction({
            id: record.id,
            reference: record.reference,
            productId: record.productId,
            customerId: record.customerId,
            quantity: record.quantity,
            productAmountInCents: record.productAmountInCents,
            baseFeeInCents: record.baseFeeInCents,
            deliveryFeeInCents: record.deliveryFeeInCents,
            totalInCents: record.totalInCents,
            status: record.status,
            externalTransactionId: record.externalTransactionId,
            paymentMethodType: record.paymentMethodType,
            cardBrand: record.cardBrand,
            cardLastFour: record.cardLastFour,
            statusMessage: record.statusMessage,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
};
exports.PrismaTransactionRepository = PrismaTransactionRepository;
exports.PrismaTransactionRepository = PrismaTransactionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTransactionRepository);
//# sourceMappingURL=prisma-transaction.repository.js.map