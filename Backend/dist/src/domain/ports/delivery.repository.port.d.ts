import { Delivery, DeliveryStatus } from '../entities/delivery.entity';
export declare const DELIVERY_REPOSITORY: unique symbol;
export interface CreateDeliveryData {
    transactionId: string;
    customerId: string;
    address: string;
    city: string;
    department: string;
    postalCode?: string;
}
export interface DeliveryRepositoryPort {
    create(data: CreateDeliveryData): Promise<Delivery>;
    findByTransactionId(transactionId: string): Promise<Delivery | null>;
    updateStatus(transactionId: string, status: DeliveryStatus): Promise<Delivery>;
}
