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
exports.PrismaCustomerRepository = void 0;
const common_1 = require("@nestjs/common");
const customer_entity_1 = require("../../domain/entities/customer.entity");
const prisma_service_1 = require("./prisma.service");
let PrismaCustomerRepository = class PrismaCustomerRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertByEmail(data) {
        const record = await this.prisma.customer.upsert({
            where: { email: data.email },
            update: {
                fullName: data.fullName,
                phone: data.phone,
            },
            create: {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
            },
        });
        return this.toDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.customer.findUnique({ where: { id } });
        return record ? this.toDomain(record) : null;
    }
    toDomain(record) {
        return new customer_entity_1.Customer({
            id: record.id,
            fullName: record.fullName,
            email: record.email,
            phone: record.phone,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
};
exports.PrismaCustomerRepository = PrismaCustomerRepository;
exports.PrismaCustomerRepository = PrismaCustomerRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCustomerRepository);
//# sourceMappingURL=prisma-customer.repository.js.map