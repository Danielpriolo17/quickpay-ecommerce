import { Customer } from '../entities/customer.entity';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface UpsertCustomerData {
  fullName: string;
  email: string;
  phone: string;
}

export interface CustomerRepositoryPort {
  upsertByEmail(data: UpsertCustomerData): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
}