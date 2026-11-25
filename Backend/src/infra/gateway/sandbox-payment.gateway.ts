import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { createHash } from 'crypto';
import { TransactionStatus } from '../../domain/entities/transaction.entity';
import {
  PaymentGatewayPort,
  PaymentGatewayResult,
  ProcessCardPaymentInput,
} from '../../domain/ports/payment-gateway.port';
import { DomainError } from '../../shared/errors/domain.error';
import { fail, ok, Result } from '../../shared/rop/result';

interface MerchantTokens {
  acceptanceToken: string;
  personalAuthToken?: string;
}

interface CardTokenResponse {
  token: string;
  brand?: string;
  lastFour?: string;
}

interface GatewayTransactionData {
  id: string;
  status: string;
  status_message?: string | null;
  payment_method?: {
    extra?: {
      brand?: string;
      last_four?: string;
    };
  };
}

@Injectable()
export class SandboxPaymentGateway implements PaymentGatewayPort {
  private readonly logger = new Logger(SandboxPaymentGateway.name);
  private readonly httpClient: AxiosInstance;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integritySecret: string;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.getOrThrow<string>(
      'PAYMENT_GATEWAY_URL',
    );
    this.publicKey = this.configService.getOrThrow<string>(
      'PAYMENT_PUBLIC_KEY',
    );
    this.privateKey = this.configService.getOrThrow<string>(
      'PAYMENT_PRIVATE_KEY',
    );
    this.integritySecret = this.configService.getOrThrow<string>(
      'PAYMENT_INTEGRITY_SECRET',
    );

    this.httpClient = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async processCardPayment(
    input: ProcessCardPaymentInput,
  ): Promise<Result<PaymentGatewayResult, DomainError>> {
    try {
      const merchantTokens = await this.fetchMerchantTokens();
      const cardToken = await this.tokenizeCard(input);
      const signature = this.generateIntegritySignature(
        input.reference,
        input.amountInCents,
        input.currency,
      );

      const createdTx = await this.createGatewayTransaction({
        input,
        merchantTokens,
        cardToken: cardToken.token,
        signature,
      });

      const finalTx =
        createdTx.status === 'PENDING'
          ? await this.pollTransactionStatus(createdTx.id)
          : createdTx;

      return ok({
        externalTransactionId: finalTx.id,
        status: this.mapStatus(finalTx.status),
        cardBrand:
          finalTx.payment_method?.extra?.brand ??
          cardToken.brand ??
          this.detectCardBrand(input.card.number),
        cardLastFour:
          finalTx.payment_method?.extra?.last_four ??
          cardToken.lastFour ??
          input.card.number.slice(-4),
        statusMessage: finalTx.status_message ?? undefined,
      });
    } catch (error) {
      const message = this.extractAxiosErrorMessage(error);
      this.logger.error(`Payment gateway failure: ${message}`);
      return fail(DomainError.paymentGatewayError(message));
    }
  }

  private async fetchMerchantTokens(): Promise<MerchantTokens> {
    const response = await this.httpClient.get(`/merchants/${this.publicKey}`);
    const data = response.data?.data;
    const acceptanceToken = data?.presigned_acceptance?.acceptance_token;
    const personalAuthToken =
      data?.presigned_personal_data_auth?.acceptance_token;

    if (!acceptanceToken) {
      throw new Error('Could not obtain merchant acceptance token');
    }

    return { acceptanceToken, personalAuthToken };
  }

  private async tokenizeCard(
    input: ProcessCardPaymentInput,
  ): Promise<CardTokenResponse> {
    const response = await this.httpClient.post(
      '/tokens/cards',
      {
        number: input.card.number.replace(/\s+/g, ''),
        cvc: input.card.cvc,
        exp_month: input.card.expMonth.padStart(2, '0'),
        exp_year: input.card.expYear.slice(-2),
        card_holder: input.card.cardHolder.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
        },
      },
    );

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

  private generateIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const raw = `${reference}${amountInCents}${currency}${this.integritySecret}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  private async createGatewayTransaction(params: {
    input: ProcessCardPaymentInput;
    merchantTokens: MerchantTokens;
    cardToken: string;
    signature: string;
  }): Promise<GatewayTransactionData> {
    const payload: Record<string, unknown> = {
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

    return response.data?.data as GatewayTransactionData;
  }

  private async pollTransactionStatus(
    externalId: string,
    maxAttempts = 6,
    delayMs = 1500,
  ): Promise<GatewayTransactionData> {
    let latest: GatewayTransactionData = { id: externalId, status: 'PENDING' };

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      try {
        const response = await this.httpClient.get(
          `/transactions/${externalId}`,
          {
            headers: {
              Authorization: `Bearer ${this.publicKey}`,
            },
          },
        );
        latest = response.data?.data as GatewayTransactionData;

        if (latest.status !== 'PENDING') {
          return latest;
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          this.logger.warn(
            `Transaction ${externalId} not indexed yet (attempt ${attempt + 1}/${maxAttempts})`,
          );
          continue;
        }
        throw error;
      }
    }

    return latest;
  }

  private mapStatus(status: string): TransactionStatus {
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

  private detectCardBrand(cardNumber: string): string {
    const clean = cardNumber.replace(/\D/g, '');
    if (/^4/.test(clean)) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
    return 'CARD';
  }

  private extractAxiosErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
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
}