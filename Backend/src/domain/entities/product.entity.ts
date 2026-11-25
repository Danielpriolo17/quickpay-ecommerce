export interface ProductProps {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  constructor(private readonly props: ProductProps) {}

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string {
    return this.props.description;
  }
  get priceInCents(): number {
    return this.props.priceInCents;
  }
  get stock(): number {
    return this.props.stock;
  }
  get imageUrl(): string {
    return this.props.imageUrl;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  hasSufficientStock(quantity: number): boolean {
    return quantity > 0 && this.props.stock >= quantity;
  }

  calculateSubtotalInCents(quantity: number): number {
    return this.props.priceInCents * quantity;
  }

  toJSON(): ProductProps {
    return { ...this.props };
  }
}