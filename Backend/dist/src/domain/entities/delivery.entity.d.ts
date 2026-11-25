export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'DELIVERED' | 'CANCELLED';
export interface DeliveryProps {
    id: string;
    transactionId: string;
    customerId: string;
    address: string;
    city: string;
    department: string;
    postalCode?: string | null;
    status: DeliveryStatus;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Delivery {
    private readonly props;
    constructor(props: DeliveryProps);
    get id(): string;
    get transactionId(): string;
    get customerId(): string;
    get status(): DeliveryStatus;
    toJSON(): DeliveryProps;
}
