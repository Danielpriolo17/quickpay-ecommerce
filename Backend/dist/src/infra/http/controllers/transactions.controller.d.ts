import { CreateTransactionUseCase } from '../../../aplication/use_cases/create-transaction.use-case';
import { GetTransactionUseCase } from '../../../aplication/use_cases/get-transaction.use-case';
import { ProcessPaymentUseCase } from '../../../aplication/use_cases/process-payment.use-case';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';
export declare class TransactionsController {
    private readonly createTransactionUseCase;
    private readonly processPaymentUseCase;
    private readonly getTransactionUseCase;
    constructor(createTransactionUseCase: CreateTransactionUseCase, processPaymentUseCase: ProcessPaymentUseCase, getTransactionUseCase: GetTransactionUseCase);
    create(dto: CreateTransactionDto): Promise<{
        data: {
            transaction: import("../../../domain/entities/transaction.entity").TransactionProps;
            customer: import("../../../domain/entities/customer.entity").CustomerProps;
            delivery: import("../../../domain/entities/delivery.entity").DeliveryProps;
            product: import("../../../domain/entities/product.entity").ProductProps;
        };
    }>;
    processPayment(id: string, dto: ProcessPaymentDto): Promise<{
        data: {
            transaction: import("../../../domain/entities/transaction.entity").TransactionProps;
            delivery: import("../../../domain/entities/delivery.entity").DeliveryProps;
            product: import("../../../domain/entities/product.entity").ProductProps;
        };
    }>;
    findById(id: string): Promise<{
        data: {
            transaction: import("../../../domain/entities/transaction.entity").TransactionProps;
            delivery: import("../../../domain/entities/delivery.entity").DeliveryProps;
        };
    }>;
}
