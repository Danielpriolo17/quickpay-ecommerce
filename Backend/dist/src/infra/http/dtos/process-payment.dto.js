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
exports.ProcessPaymentDto = exports.CardDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CardDataDto {
}
exports.CardDataDto = CardDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '4242424242424242',
        description: '13 to 19 digit card number (sandbox test card)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{13,19}$/, {
        message: 'card number must contain between 13 and 19 digits',
    }),
    __metadata("design:type", String)
], CardDataDto.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{3,4}$/, { message: 'cvc must be 3 or 4 digits' }),
    __metadata("design:type", String)
], CardDataDto.prototype, "cvc", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '08' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^(0[1-9]|1[0-2])$/, {
        message: 'expMonth must be between 01 and 12',
    }),
    __metadata("design:type", String)
], CardDataDto.prototype, "expMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '29' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{2}(\d{2})?$/, {
        message: 'expYear must be 2 or 4 digits (e.g. 29 or 2029)',
    }),
    __metadata("design:type", String)
], CardDataDto.prototype, "expYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'JUAN PEREZ' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CardDataDto.prototype, "cardHolder", void 0);
class ProcessPaymentDto {
}
exports.ProcessPaymentDto = ProcessPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, minimum: 1, maximum: 36 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(36),
    __metadata("design:type", Number)
], ProcessPaymentDto.prototype, "installments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CardDataDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CardDataDto),
    __metadata("design:type", CardDataDto)
], ProcessPaymentDto.prototype, "card", void 0);
//# sourceMappingURL=process-payment.dto.js.map