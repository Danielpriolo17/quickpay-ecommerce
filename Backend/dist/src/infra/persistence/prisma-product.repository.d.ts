import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { PrismaService } from './prisma.service';
export declare class PrismaProductRepository implements ProductRepositoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Product[]>;
    findById(id: string): Promise<Product | null>;
    decrementStock(id: string, quantity: number): Promise<Product>;
    private toDomain;
}
