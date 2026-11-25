import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTransactionUseCase } from '../../../aplication/use_cases/create-transaction.use-case';
import { GetTransactionUseCase } from '../../../aplication/use_cases/get-transaction.use-case';
import { ProcessPaymentUseCase } from '../../../aplication/use_cases/process-payment.use-case';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';
import { unwrapOrThrowHttp } from '../helpers/result-to-http.helper';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a PENDING transaction along with customer and delivery',
  })
  @ApiResponse({ status: 201, description: 'Transaction created in PENDING' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  async create(@Body() dto: CreateTransactionDto) {
    const result = unwrapOrThrowHttp(
      await this.createTransactionUseCase.execute(dto),
    );

    return {
      data: {
        transaction: result.transaction.toJSON(),
        customer: result.customer.toJSON(),
        delivery: result.delivery.toJSON(),
        product: result.product.toJSON(),
      },
    };
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Process credit card payment in Sandbox gateway and update stock/delivery',
  })
  @ApiResponse({ status: 200, description: 'Payment processed' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 409, description: 'Transaction already processed' })
  async processPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProcessPaymentDto,
  ) {
    const result = unwrapOrThrowHttp(
      await this.processPaymentUseCase.execute({
        transactionId: id,
        installments: dto.installments,
        card: dto.card,
      }),
    );

    return {
      data: {
        transaction: result.transaction.toJSON(),
        delivery: result.delivery.toJSON(),
        product: result.product.toJSON(),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction and delivery status by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const result = unwrapOrThrowHttp(
      await this.getTransactionUseCase.execute(id),
    );

    return {
      data: {
        transaction: result.transaction.toJSON(),
        delivery: result.delivery ? result.delivery.toJSON() : null,
      },
    };
  }
}