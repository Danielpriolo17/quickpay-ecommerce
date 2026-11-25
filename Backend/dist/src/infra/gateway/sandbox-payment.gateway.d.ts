import { ConfigService } from '@nestjs/config';
import { PaymentGatewayPort, PaymentGatewayResult, ProcessCardPaymentInput } from '../../domain/ports/payment-gateway.port';
import { DomainError } from '../../shared/errors/domain.error';
import { Result } from '../../shared/rop/result';
export declare class SandboxPaymentGateway implements PaymentGatewayPort {
    private readonly configService;
    private readonly logger;
    private readonly httpClient;
    private readonly publicKey;
    private readonly privateKey;
    private readonly integritySecret;
    constructor(configService: ConfigService);
    processCardPayment(input: ProcessCardPaymentInput): Promise<Result<PaymentGatewayResult, DomainError>>;
    private fetchMerchantTokens;
    private tokenizeCard;
    private generateIntegritySignature;
    private createGatewayTransaction;
    private pollTransactionStatus;
    private mapStatus;
    private detectCardBrand;
    private extractAxiosErrorMessage;
}
