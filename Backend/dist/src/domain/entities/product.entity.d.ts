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
export declare class Product {
    private readonly props;
    constructor(props: ProductProps);
    get id(): string;
    get name(): string;
    get description(): string;
    get priceInCents(): number;
    get stock(): number;
    get imageUrl(): string;
    get createdAt(): Date;
    get updatedAt(): Date;
    hasSufficientStock(quantity: number): boolean;
    calculateSubtotalInCents(quantity: number): number;
    toJSON(): ProductProps;
}
