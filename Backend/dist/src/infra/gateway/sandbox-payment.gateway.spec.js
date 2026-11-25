"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const globals_1 = require("@jest/globals");
const sandbox_payment_gateway_1 = require("./sandbox-payment.gateway");
globals_1.jest.mock('axios');
const mockedAxios = axios_1.default;
(0, globals_1.describe)('SandboxPaymentGateway', () => {
    const httpClientMock = {
        get: globals_1.jest.fn(),
        post: globals_1.jest.fn(),
    };
    const configServiceMock = {
        getOrThrow: globals_1.jest.fn((key) => {
            const map = {
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
        currency: 'COP',
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
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        mockedAxios.create.mockReturnValue(httpClientMock);
        mockedAxios.isAxiosError.mockImplementation((err) => Boolean(err?.isAxiosError));
    });
    (0, globals_1.it)('should process payment and poll until APPROVED', async () => {
        const timeoutSpy = globals_1.jest
            .spyOn(global, 'setTimeout')
            .mockImplementation((cb) => {
            cb();
            return 0;
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
        const gateway = new sandbox_payment_gateway_1.SandboxPaymentGateway(configServiceMock);
        const result = await gateway.processCardPayment(sampleInput);
        timeoutSpy.mockRestore();
        (0, globals_1.expect)(result.isOk).toBe(true);
        if (result.isOk) {
            (0, globals_1.expect)(result.value.status).toBe('APPROVED');
            (0, globals_1.expect)(result.value.cardBrand).toBe('VISA');
            (0, globals_1.expect)(result.value.cardLastFour).toBe('4242');
        }
    });
    (0, globals_1.it)('should return PAYMENT_GATEWAY_ERROR when Axios request fails', async () => {
        httpClientMock.get.mockRejectedValue({
            isAxiosError: true,
            message: 'Not Found',
            config: { method: 'get', url: '/merchants/pub_test_123' },
            response: {
                status: 404,
                data: { error: { reason: 'Entity not found' } },
            },
        });
        const gateway = new sandbox_payment_gateway_1.SandboxPaymentGateway(configServiceMock);
        const result = await gateway.processCardPayment(sampleInput);
        (0, globals_1.expect)(result.isFail).toBe(true);
        if (result.isFail) {
            (0, globals_1.expect)(result.error.code).toBe('PAYMENT_GATEWAY_ERROR');
            (0, globals_1.expect)(result.error.message).toContain('Entity not found');
        }
    });
});
//# sourceMappingURL=sandbox-payment.gateway.spec.js.map