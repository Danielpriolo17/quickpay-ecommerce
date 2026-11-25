import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { DomainError } from '../../shared/errors/domain.error';
import { Result } from '../../shared/rop/result';
export declare class GetProductsUseCase {
    private readonly productRepository;
    constructor(productRepository: ProductRepositoryPort);
    executeAll(): Promise<Result<Product[], DomainError>>;
    executeById(productId: string): Promise<Result<Product, DomainError>>;
}
