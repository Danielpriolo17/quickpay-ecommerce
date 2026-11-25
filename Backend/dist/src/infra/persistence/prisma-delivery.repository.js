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
exports.PrismaDeliveryRepository = void 0;
const common_1 = require("@nestjs/common");
const delivery_entity_1 = require("../../domain/entities/delivery.entity");
const prisma_service_1 = require("./prisma.service");
let PrismaDeliveryRepository = class PrismaDeliveryRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const record = await this.prisma.delivery.create({
            data: {
                transactionId: data.transactionId,
                customerId: data.customerId,
                address: data.address,
                city: data.city,
                department: data.department,
                postalCode: data.postalCode,
                status: 'PENDING',
            },
        });
        return this.toDomain(record);
    }
    async findByTransactionId(transactionId) {
        const record = await this.prisma.delivery.findUnique({
            where: { transactionId },
        });
        return record ? this.toDomain(record) : null;
    }
    async updateStatus(transactionId, status) {
        const updated = await this.prisma.delivery.update({
            where: { transactionId },
            data: { status },
        });
        return this.toDomain(updated);
    }
    toDomain(record) {
        return new delivery_entity_1.Delivery({
            id: record.id,
            transactionId: record.transactionId,
            customerId: record.customerId,
            address: record.address,
            city: record.city,
            department: record.department,
            postalCode: record.postalCode,
            status: record.status,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
};
exports.PrismaDeliveryRepository = PrismaDeliveryRepository;
exports.PrismaDeliveryRepository = PrismaDeliveryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaDeliveryRepository);
//# sourceMappingURL=prisma-delivery.repository.js.map