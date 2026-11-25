import { Product } from '../entities/product.entity';
export declare const PRODUCT_REPOSITORY: unique symbol;
export interface ProductRepositoryPort {
    findAll(): Promise<Product[]>;
    findById(id: string): Promise<Product | null>;
    decrementStock(id: string, quantity: number): Promise<Product>;
}
