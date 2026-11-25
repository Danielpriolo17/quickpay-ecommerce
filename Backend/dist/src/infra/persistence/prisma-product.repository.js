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
exports.PrismaProductRepository = void 0;
const common_1 = require("@nestjs/common");
const product_entity_1 = require("../../domain/entities/product.entity");
const prisma_service_1 = require("./prisma.service");
let PrismaProductRepository = class PrismaProductRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const records = await this.prisma.product.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return records.map((record) => this.toDomain(record));
    }
    async findById(id) {
        const record = await this.prisma.product.findUnique({ where: { id } });
        return record ? this.toDomain(record) : null;
    }
    async decrementStock(id, quantity) {
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                stock: {
                    decrement: quantity,
                },
            },
        });
        return this.toDomain(updated);
    }
    toDomain(record) {
        return new product_entity_1.Product({
            id: record.id,
            name: record.name,
            description: record.description,
            priceInCents: record.priceInCents,
            stock: record.stock,
            imageUrl: record.imageUrl,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
};
exports.PrismaProductRepository = PrismaProductRepository;
exports.PrismaProductRepository = PrismaProductRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaProductRepository);
//# sourceMappingURL=prisma-product.repository.js.map