export interface CustomerProps {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Customer {
    private readonly props;
    constructor(props: CustomerProps);
    get id(): string;
    get fullName(): string;
    get email(): string;
    get phone(): string;
    toJSON(): CustomerProps;
}
