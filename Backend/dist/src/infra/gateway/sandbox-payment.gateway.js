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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SandboxPaymentGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxPaymentGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const domain_error_1 = require("../../shared/errors/domain.error");
const result_1 = require("../../shared/rop/result");
let SandboxPaymentGateway = SandboxPaymentGateway_1 = class SandboxPaymentGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SandboxPaymentGateway_1.name);
        const baseURL = this.configService.getOrThrow('PAYMENT_GATEWAY_URL');
        this.publicKey = this.configService.getOrThrow('PAYMENT_PUBLIC_KEY');
        this.privateKey = this.configService.getOrThrow('PAYMENT_PRIVATE_KEY');
        this.integritySecret = this.configService.getOrThrow('PAYMENT_INTEGRITY_SECRET');
        this.httpClient = axios_1.default.create({
            baseURL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async processCardPayment(input) {
        try {
            const merchantTokens = await this.fetchMerchantTokens();
            const cardToken = await this.tokenizeCard(input);
            const signature = this.generateIntegritySignature(input.reference, input.amountInCents, input.currency);
            const createdTx = await this.createGatewayTransaction({
                input,
                merchantTokens,
                cardToken: cardToken.token,
                signature,
            });
            const finalTx = createdTx.status === 'PENDING'
                ? await this.pollTransactionStatus(createdTx.id)
                : createdTx;
            return (0, result_1.ok)({
                externalTransactionId: finalTx.id,
                status: this.mapStatus(finalTx.status),
                cardBrand: finalTx.payment_method?.extra?.brand ??
                    cardToken.brand ??
                    this.detectCardBrand(input.card.number),
                cardLastFour: finalTx.payment_method?.extra?.last_four ??
                    cardToken.lastFour ??
                    input.card.number.slice(-4),
                statusMessage: finalTx.status_message ?? undefined,
            });
        }
        catch (error) {
            const message = this.extractAxiosErrorMessage(error);
            this.logger.error(`Payment gateway failure: ${message}`);
            return (0, result_1.fail)(domain_error_1.DomainError.paymentGatewayError(message));
        }
    }
    async fetchMerchantTokens() {
        const response = await this.httpClient.get(`/merchants/${this.publicKey}`);
        const data = response.data?.data;
        const acceptanceToken = data?.presigned_acceptance?.acceptance_token;
        const personalAuthToken = data?.presigned_personal_data_auth?.acceptance_token;
        if (!acceptanceToken) {
            throw new Error('Could not obtain merchant acceptance token');
        }
        return { acceptanceToken, personalAuthToken };
    }
    async tokenizeCard(input) {
        const response = await this.httpClient.post('/tokens/cards', {
            number: input.card.number.replace(/\s+/g, ''),
            cvc: input.card.cvc,
            exp_month: input.card.expMonth.padStart(2, '0'),
            exp_year: input.card.expYear.slice(-2),
            card_holder: input.card.cardHolder.trim(),
        }, {
            headers: {
                Authorization: `Bearer ${this.publicKey}`,
            },
        });
        const data = response.data?.data;
        if (!data?.id) {
            throw new Error('Card tokenization did not return a valid token');
        }
        return {
            token: data.id,
            brand: data.brand,
            lastFour: data.last_four,
        };
    }
    generateIntegritySignature(reference, amountInCents, currency) {
        const raw = `${reference}${amountInCents}${currency}${this.integritySecret}`;
        return (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
    }
    async createGatewayTransaction(params) {
        const payload = {
            acceptance_token: params.merchantTokens.acceptanceToken,
            amount_in_cents: params.input.amountInCents,
            currency: params.input.currency,
            signature: params.signature,
            customer_email: params.input.customerEmail,
            reference: params.input.reference,
            payment_method: {
                type: 'CARD',
                token: params.cardToken,
                installments: params.input.installments,
            },
        };
        if (params.merchantTokens.personalAuthToken) {
            payload.accept_personal_auth = params.merchantTokens.personalAuthToken;
        }
        const response = await this.httpClient.post('/transactions', payload, {
            headers: {
                Authorization: `Bearer ${this.privateKey}`,
            },
        });
        return response.data?.data;
    }
    async pollTransactionStatus(externalId, maxAttempts = 6, delayMs = 1500) {
        let latest = { id: externalId, status: 'PENDING' };
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            try {
                const response = await this.httpClient.get(`/transactions/${externalId}`, {
                    headers: {
                        Authorization: `Bearer ${this.publicKey}`,
                    },
                });
                latest = response.data?.data;
                if (latest.status !== 'PENDING') {
                    return latest;
                }
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                    this.logger.warn(`Transaction ${externalId} not indexed yet (attempt ${attempt + 1}/${maxAttempts})`);
                    continue;
                }
                throw error;
            }
        }
        return latest;
    }
    mapStatus(status) {
        switch (status) {
            case 'APPROVED':
                return 'APPROVED';
            case 'DECLINED':
                return 'DECLINED';
            case 'VOIDED':
                return 'VOIDED';
            case 'PENDING':
                return 'PENDING';
            default:
                return 'ERROR';
        }
    }
    detectCardBrand(cardNumber) {
        const clean = cardNumber.replace(/\D/g, '');
        if (/^4/.test(clean))
            return 'VISA';
        if (/^(5[1-5]|2[2-7])/.test(clean))
            return 'MASTERCARD';
        return 'CARD';
    }
    extractAxiosErrorMessage(error) {
        if (axios_1.default.isAxiosError(error)) {
            const endpoint = `${error.config?.method?.toUpperCase() ?? 'REQ'} ${error.config?.url ?? ''}`;
            const apiError = error.response?.data?.error;
            const detail = apiError?.messages
                ? JSON.stringify(apiError.messages)
                : apiError?.reason
                    ? String(apiError.reason)
                    : error.message;
            return `[${endpoint}] ${detail}`;
        }
        return error instanceof Error ? error.message : 'Unknown gateway error';
    }
};
exports.SandboxPaymentGateway = SandboxPaymentGateway;
exports.SandboxPaymentGateway = SandboxPaymentGateway = SandboxPaymentGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SandboxPaymentGateway);
//# sourceMappingURL=sandbox-payment.gateway.js.map