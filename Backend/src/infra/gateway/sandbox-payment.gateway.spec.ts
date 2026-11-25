import axios, { type AxiosError } from 'axios';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { SandboxPaymentGateway } from './sandbox-payment.gateway';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SandboxPaymentGateway', () => {
  const httpClientMock: any = {
    get: jest.fn(),
    post: jest.fn(),
  };

  const configServiceMock = {
    getOrThrow: jest.fn((key: string) => {
      const map: Record<string, string> = {
        PAYMENT_GATEWAY_URL: 'https://sandbox.test/v1',
        PAYMENT_PUBLIC_KEY: 'pub_test_123',
        PAYMENT_PRIVATE_KEY: 'prv_test_123',
        PAYMENT_INTEGRITY_SECRET: 'integrity_secret',
      };
      return map[key];
    }),
  };

  const sampleInput = {
    reference: 'TXN-100',
    amountInCents: 500000,
    currency: 'COP' as const,
    customerEmail: 'buyer@test.com',
    installments: 1,
    card: {
      number: '4242424242424242',
      cvc: '123',
      expMonth: '08',
      expYear: '29',
      cardHolder: 'TEST USER',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(httpClientMock as any);
    mockedAxios.isAxiosError.mockImplementation(
      <T = any, D = any, P = any>(
        err: any,
      ): err is AxiosError<T, D, P> => Boolean(err?.isAxiosError),
    );
  });

  it('should process payment and poll until APPROVED', async () => {
    const timeoutSpy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((cb: any) => {
        cb();
        return 0 as any;
      });

    httpClientMock.get
      .mockResolvedValueOnce({
        data: {
          data: {
            presigned_acceptance: { acceptance_token: 'acc_tok' },
            presigned_personal_data_auth: { acceptance_token: 'pers_tok' },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            id: 'ext-tx-1',
            status: 'APPROVED',
            payment_method: { extra: { brand: 'VISA', last_four: '4242' } },
          },
        },
      });

    httpClientMock.post
      .mockResolvedValueOnce({
        data: { data: { id: 'tok_card_1', brand: 'VISA', last_four: '4242' } },
      })
      .mockResolvedValueOnce({
        data: { data: { id: 'ext-tx-1', status: 'PENDING' } },
      });

    const gateway = new SandboxPaymentGateway(configServiceMock as any);
    const result = await gateway.processCardPayment(sampleInput);

    timeoutSpy.mockRestore();

    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.status).toBe('APPROVED');
      expect(result.value.cardBrand).toBe('VISA');
      expect(result.value.cardLastFour).toBe('4242');
    }
  });

  it('should return PAYMENT_GATEWAY_ERROR when Axios request fails', async () => {
    httpClientMock.get.mockRejectedValue({
      isAxiosError: true,
      message: 'Not Found',
      config: { method: 'get', url: '/merchants/pub_test_123' },
      response: {
        status: 404,
        data: { error: { reason: 'Entity not found' } },
      },
    });

    const gateway = new SandboxPaymentGateway(configServiceMock as any);
    const result = await gateway.processCardPayment(sampleInput);

    expect(result.isFail).toBe(true);
    if (result.isFail) {
      expect(result.error.code).toBe('PAYMENT_GATEWAY_ERROR');
      expect(result.error.message).toContain('Entity not found');
    }
  });
});