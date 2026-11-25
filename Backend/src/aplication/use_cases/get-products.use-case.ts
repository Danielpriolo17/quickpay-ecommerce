import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from '../../domain/ports/product.repository.port';
import { DomainError } from '../../shared/errors/domain.error';
import { fail, ok, Result } from '../../shared/rop/result';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async executeAll(): Promise<Result<Product[], DomainError>> {
    try {
      const products = await this.productRepository.findAll();
      return ok(products);
    } catch (error) {
      return fail(
        DomainError.persistenceError(
          error instanceof Error ? error.message : 'Failed to fetch products',
        ),
      );
    }
  }

  async executeById(productId: string): Promise<Result<Product, DomainError>> {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        return fail(DomainError.productNotFound(productId));
      }
      return ok(product);
    } catch (error) {
      return fail(
        DomainError.persistenceError(
          error instanceof Error ? error.message : 'Failed to fetch product',
        ),
      );
    }
  }
}