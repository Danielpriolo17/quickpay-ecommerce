"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_1 = require("@nestjs/common");
const customer_entity_1 = require("../../../domain/entities/customer.entity");
const delivery_entity_1 = require("../../../domain/entities/delivery.entity");
const product_entity_1 = require("../../../domain/entities/product.entity");
const transaction_entity_1 = require("../../../domain/entities/transaction.entity");
const domain_error_1 = require("../../../shared/errors/domain.error");
const result_1 = require("../../../shared/rop/result");
const result_to_http_helper_1 = require("../helpers/result-to-http.helper");
const health_controller_1 = require("./health.controller");
const products_controller_1 = require("./products.controller");
const transactions_controller_1 = require("./transactions.controller");
(0, globals_1.describe)('HTTP Controllers & Helper', () => {
    const now = new Date();
    const product = new product_entity_1.Product({
        id: 'p1',
        name: 'Watch',
        description: 'Smart',
        priceInCents: 100000,
        stock: 4,
        imageUrl: 'https://img.test/w.jpg',
        createdAt: now,
        updatedAt: now,
    });
    const customer = new customer_entity_1.Customer({
        id: 'c1',
        fullName: 'Luis',
        email: 'luis@test.com',
        phone: '+573001112233',
        createdAt: now,
        updatedAt: now,
    });
    const transaction = new transaction_entity_1.Transaction({
        id: 't1',
        reference: 'TXN-1',
        productId: 'p1',
        customerId: 'c1',
        quantity: 1,
        productAmountInCents: 100000,
        baseFeeInCents: 30000,
        deliveryFeeInCents: 50000,
        totalInCents: 180000,
        status: 'PENDING',
        paymentMethodType: 'CARD',
        createdAt: now,
        updatedAt: now,
    });
    const delivery = new delivery_entity_1.Delivery({
        id: 'd1',
        transactionId: 't1',
        customerId: 'c1',
        address: 'Calle 1',
        city: 'Montería',
        department: 'Córdoba',
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
    });
    (0, globals_1.it)('unwrapOrThrowHttp should return value on Ok and throw HttpException on Fail', () => {
        (0, globals_1.expect)((0, result_to_http_helper_1.unwrapOrThrowHttp)((0, result_1.ok)('success'))).toBe('success');
        (0, globals_1.expect)(() => (0, result_to_http_helper_1.unwrapOrThrowHttp)((0, result_1.fail)(domain_error_1.DomainError.productNotFound('p1')))).toThrow(common_1.HttpException);
    });
    (0, globals_1.it)('HealthController should return ok status', () => {
        const controller = new health_controller_1.HealthController();
        const response = controller.check();
        (0, globals_1.expect)(response.status).toBe('ok');
        (0, globals_1.expect)(response.timestamp).toBeDefined();
    });
    (0, globals_1.it)('ProductsController should list and fetch by id', async () => {
        const useCase = {
            executeAll: globals_1.jest
                .fn()
                .mockResolvedValue((0, result_1.ok)([product])),
            executeById: globals_1.jest
                .fn()
                .mockResolvedValue((0, result_1.ok)(product)),
        };
        const controller = new products_controller_1.ProductsController(useCase);
        const list = await controller.findAll();
        (0, globals_1.expect)(list.data).toHaveLength(1);
        const single = await controller.findById('p1');
        (0, globals_1.expect)(single.data.id).toBe('p1');
    });
    (0, globals_1.it)('TransactionsController should create, pay and fetch by id', async () => {
        const createUseCase = {
            execute: globals_1.jest
                .fn()
                .mockResolvedValue((0, result_1.ok)({ transaction, customer, delivery, product })),
        };
        const payUseCase = {
            execute: globals_1.jest
                .fn()
                .mockResolvedValue((0, result_1.ok)({ transaction, delivery, product })),
        };
        const getUseCase = {
            execute: globals_1.jest
                .fn()
                .mockResolvedValue((0, result_1.ok)({ transaction, delivery })),
        };
        const controller = new transactions_controller_1.TransactionsController(createUseCase, payUseCase, getUseCase);
        const created = await controller.create({});
        (0, globals_1.expect)(created.data.transaction.id).toBe('t1');
        const paid = await controller.processPayment('t1', {
            installments: 1,
            card: {},
        });
        (0, globals_1.expect)(paid.data.product.id).toBe('p1');
        const fetched = await controller.findById('t1');
        (0, globals_1.expect)(fetched.data.delivery?.id).toBe('d1');
    });
});
//# sourceMappingURL=controllers.spec.js.map