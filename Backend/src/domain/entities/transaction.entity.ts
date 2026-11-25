export type TransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'VOIDED'
  | 'ERROR';

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

export class Transaction {
  constructor(private readonly props: TransactionProps) {}

  get id(): string {
    return this.props.id;
  }
  get reference(): string {
    return this.props.reference;
  }
  get productId(): string {
    return this.props.productId;
  }
  get customerId(): string {
    return this.props.customerId;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get totalInCents(): number {
    return this.props.totalInCents;
  }
  get status(): TransactionStatus {
    return this.props.status;
  }
  get externalTransactionId(): string | null | undefined {
    return this.props.externalTransactionId;
  }

  isPending(): boolean {
    return this.props.status === 'PENDING';
  }

  isApproved(): boolean {
    return this.props.status === 'APPROVED';
  }

  toJSON(): TransactionProps {
    return { ...this.props };
  }
}