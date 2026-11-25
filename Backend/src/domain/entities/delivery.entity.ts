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

export class Delivery {
  constructor(private readonly props: DeliveryProps) {}

  get id(): string {
    return this.props.id;
  }
  get transactionId(): string {
    return this.props.transactionId;
  }
  get customerId(): string {
    return this.props.customerId;
  }
  get status(): DeliveryStatus {
    return this.props.status;
  }

  toJSON(): DeliveryProps {
    return { ...this.props };
  }
}