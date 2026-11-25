export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
export interface TransactionProps {
    id: string;
    reference: string;
    productId: string;
    customerId: string;
    quantity: number;
    productAmountInCents: number;
    baseFeeInCents: number;
    deliveryFeeInCents: number;
    totalInCents: number;
    status: TransactionStatus;
    externalTransactionId?: string | null;
    paymentMethodType: string;
    cardBrand?: string | null;
    cardLastFour?: string | null;
    statusMessage?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Transaction {
    private readonly props;
    constructor(props: TransactionProps);
    get id(): string;
    get reference(): string;
    get productId(): string;
    get customerId(): string;
    get quantity(): number;
    get totalInCents(): number;
    get status(): TransactionStatus;
    get externalTransactionId(): string | null | undefined;
    isPending(): boolean;
    isApproved(): boolean;
    toJSON(): TransactionProps;
}
