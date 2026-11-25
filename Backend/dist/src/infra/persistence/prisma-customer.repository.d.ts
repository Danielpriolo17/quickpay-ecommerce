import { Customer } from '../../domain/entities/customer.entity';
import { CustomerRepositoryPort, UpsertCustomerData } from '../../domain/ports/customer.repository.port';
import { PrismaService } from './prisma.service';
export declare class PrismaCustomerRepository implements CustomerRepositoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsertByEmail(data: UpsertCustomerData): Promise<Customer>;
    findById(id: string): Promise<Customer | null>;
    private toDomain;
}
