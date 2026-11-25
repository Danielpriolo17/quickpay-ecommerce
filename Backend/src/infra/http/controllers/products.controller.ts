import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetProductsUseCase } from '../../../aplication/use_cases/get-products.use-case';
import { unwrapOrThrowHttp } from '../helpers/result-to-http.helper';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List all available products with current stock' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll() {
    const products = unwrapOrThrowHttp(
      await this.getProductsUseCase.executeAll(),
    );
    return {
      data: products.map((product) => product.toJSON()),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const product = unwrapOrThrowHttp(
      await this.getProductsUseCase.executeById(id),
    );
    return {
      data: product.toJSON(),
    };
  }
}