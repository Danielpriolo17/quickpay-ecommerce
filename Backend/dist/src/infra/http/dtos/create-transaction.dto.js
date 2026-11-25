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
exports.CreateTransactionDto = exports.DeliveryInputDto = exports.CustomerInputDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CustomerInputDto {
}
exports.CustomerInputDto = CustomerInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Juan Pérez' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CustomerInputDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'juan.perez@example.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(180),
    __metadata("design:type", String)
], CustomerInputDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+573001234567' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[+\d\s()-]{7,25}$/, {
        message: 'phone must be a valid phone number',
    }),
    __metadata("design:type", String)
], CustomerInputDto.prototype, "phone", void 0);
class DeliveryInputDto {
}
exports.DeliveryInputDto = DeliveryInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Calle 45 # 12-34 Apto 502' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(250),
    __metadata("design:type", String)
], DeliveryInputDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bogotá' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], DeliveryInputDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Cundinamarca' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], DeliveryInputDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '110111' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], DeliveryInputDto.prototype, "postalCode", void 0);
class CreateTransactionDto {
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '11111111-1111-4111-8111-111111111111' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, minimum: 1, maximum: 50 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CustomerInputDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CustomerInputDto),
    __metadata("design:type", CustomerInputDto)
], CreateTransactionDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: DeliveryInputDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DeliveryInputDto),
    __metadata("design:type", DeliveryInputDto)
], CreateTransactionDto.prototype, "delivery", void 0);
//# sourceMappingURL=create-transaction.dto.js.map