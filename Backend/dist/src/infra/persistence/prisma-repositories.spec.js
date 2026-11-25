"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const prisma_customer_repository_1 = require("./prisma-customer.repository");
const prisma_delivery_repository_1 = require("./prisma-delivery.repository");
const prisma_product_repository_1 = require("./prisma-product.repository");
const prisma_transaction_repository_1 = require("./prisma-transaction.repository");
(0, globals_1.describe)('Prisma Repository Adapters', () => {
    const now = new Date();
    const prismaMock = {
        product: {
            findMany: globals_1.jest.fn(),
            findUnique: globals_1.jest.fn(),
            update: globals_1.jest.fn(),
        },
        customer: {
            upsert: globals_1.jest.fn(),
            findUnique: globals_1.jest.fn(),
        },
        transaction: {
            create: globals_1.jest.fn(),
            findUnique: globals_1.jest.fn(),
            update: globals_1.jest.fn(),
        },
        delivery: {
            create: globals_1.jest.fn(),
            findUnique: globals_1.jest.fn(),
            update: globals_1.jest.fn(),
        },
    };
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.it)('PrismaProductRepository should map records to Product entities', async () => {
        const record = {
            id: 'p1',
            name: 'Item',
            description: 'Desc',
            priceInCents: 1000,
            stock: 5,
            imageUrl: 'url',
            createdAt: now,
            updatedAt: now,
        };
        prismaMock.product.findMany.mockResolvedValue([record]);
        prismaMock.product.findUnique.mockResolvedValueOnce(record);
        prismaMock.product.findUnique.mockResolvedValueOnce(null);
        prismaMock.product.update.mockResolvedValue({ ...record, stock: 4 });
        const repo = new prisma_product_repository_1.PrismaProductRepository(prismaMock);
        (0, globals_1.expect)(await repo.findAll()).toHaveLength(1);
        (0, globals_1.expect)((await repo.findById('p1'))?.id).toBe('p1');
        (0, globals_1.expect)(await repo.findById('none')).toBeNull();
        (0, globals_1.expect)((await repo.decrementStock('p1', 1)).stock).toBe(4);
    });
    (0, globals_1.it)('PrismaCustomerRepository should upsert and find customer', async () => {
        const record = {
            id: 'c1',
            fullName: 'Ana',
            email: 'ana@test.com',
            phone: '300',
            createdAt: now,
            updatedAt: now,
        };
        prismaMock.customer.upsert.mockResolvedValue(record);
        prismaMock.customer.findUnique.mockResolvedValueOnce(record);
        prismaMock.customer.findUnique.mockResolvedValueOnce(null);
        const repo = new prisma_customer_repository_1.PrismaCustomerRepository(prismaMock);
        (0, globals_1.expect)((await repo.upsertByEmail({
            fullName: 'Ana',
            email: 'ana@test.com',
            phone: '300',
        })).id).toBe('c1');
        (0, globals_1.expect)((await repo.findById('c1'))?.email).toBe('ana@test.com');
        (0, globals_1.expect)(await repo.findById('missing')).toBeNull();
    });
    (0, globals_1.it)('PrismaTransactionRepository should create, find and update transactions', async () => {
        const record = {
            id: 't1',
            reference: 'TXN-1',
            productId: 'p1',
            customerId: 'c1',
            quantity: 1,
            productAmountInCents: 1000,
            baseFeeInCents: 100,
            deliveryFeeInCents: 200,
            totalInCents: 1300,
            status: 'PENDING',
            externalTransactionId: null,
            paymentMethodType: 'CARD',
            cardBrand: null,
            cardLastFour: null,
            statusMessage: null,
            createdAt: now,
            updatedAt: now,
        };
        prismaMock.transaction.create.mockResolvedValue(record);
        prismaMock.transaction.findUnique.mockResolvedValue(record);
        prismaMock.transaction.update.mockResolvedValue({
            ...record,
            status: 'APPROVED',
        });
        const repo = new prisma_transaction_repository_1.PrismaTransactionRepository(prismaMock);
        (0, globals_1.expect)((await repo.create({
            reference: 'TXN-1',
            productId: 'p1',
            customerId: 'c1',
            quantity: 1,
            productAmountInCents: 1000,
            baseFeeInCents: 100,
            deliveryFeeInCents: 200,
            totalInCents: 1300,
        })).status).toBe('PENDING');
        (0, globals_1.expect)((await repo.findById('t1'))?.id).toBe('t1');
        (0, globals_1.expect)((await repo.findByReference('TXN-1'))?.reference).toBe('TXN-1');
        (0, globals_1.expect)((await repo.updateResult('t1', { status: 'APPROVED' })).status).toBe('APPROVED');
    });
    (0, globals_1.it)('PrismaDeliveryRepository should create, find and update delivery status', async () => {
        const record = {
            id: 'd1',
            transactionId: 't1',
            customerId: 'c1',
            address: 'Calle 1',
            city: 'Montería',
            department: 'Córdoba',
            postalCode: null,
            status: 'PENDING',
            createdAt: now,
            updatedAt: now,
        };
        prismaMock.delivery.create.mockResolvedValue(record);
        prismaMock.delivery.findUnique.mockResolvedValue(record);
        prismaMock.delivery.update.mockResolvedValue({
            ...record,
            status: 'ASSIGNED',
        });
        const repo = new prisma_delivery_repository_1.PrismaDeliveryRepository(prismaMock);
        (0, globals_1.expect)((await repo.create({
            transactionId: 't1',
            customerId: 'c1',
            address: 'Calle 1',
            city: 'Montería',
            department: 'Córdoba',
        })).id).toBe('d1');
        (0, globals_1.expect)((await repo.findByTransactionId('t1'))?.id).toBe('d1');
        (0, globals_1.expect)((await repo.updateStatus('t1', 'ASSIGNED')).status).toBe('ASSIGNED');
    });
});
//# sourceMappingURL=prisma-repositories.spec.js.map