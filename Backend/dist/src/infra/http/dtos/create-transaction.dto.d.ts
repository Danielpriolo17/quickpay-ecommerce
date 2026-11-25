export declare class CustomerInputDto {
    fullName: string;
    email: string;
    phone: string;
}
export declare class DeliveryInputDto {
    address: string;
    city: string;
    department: string;
    postalCode?: string;
}
export declare class CreateTransactionDto {
    productId: string;
    quantity: number;
    customer: CustomerInputDto;
    delivery: DeliveryInputDto;
}
