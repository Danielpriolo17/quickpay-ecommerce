import { Customer } from '../entities/customer.entity';
export declare const CUSTOMER_REPOSITORY: unique symbol;
export interface UpsertCustomerData {
    fullName: string;
    email: string;
    phone: string;
}
export interface CustomerRepositoryPort {
    upsertByEmail(data: UpsertCustomerData): Promise<Customer>;
    findById(id: string): Promise<Customer | null>;
}
