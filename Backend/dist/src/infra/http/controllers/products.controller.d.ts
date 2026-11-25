import { GetProductsUseCase } from '../../../aplication/use_cases/get-products.use-case';
export declare class ProductsController {
    private readonly getProductsUseCase;
    constructor(getProductsUseCase: GetProductsUseCase);
    findAll(): Promise<{
        data: import("../../../domain/entities/product.entity").ProductProps[];
    }>;
    findById(id: string): Promise<{
        data: import("../../../domain/entities/product.entity").ProductProps;
    }>;
}
