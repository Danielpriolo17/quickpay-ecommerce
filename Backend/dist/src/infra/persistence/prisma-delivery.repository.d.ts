import { Delivery, DeliveryStatus } from '../../domain/entities/delivery.entity';
import { CreateDeliveryData, DeliveryRepositoryPort } from '../../domain/ports/delivery.repository.port';
import { PrismaService } from './prisma.service';
export declare class PrismaDeliveryRepository implements DeliveryRepositoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateDeliveryData): Promise<Delivery>;
    findByTransactionId(transactionId: string): Promise<Delivery | null>;
    updateStatus(transactionId: string, status: DeliveryStatus): Promise<Delivery>;
    private toDomain;
}
