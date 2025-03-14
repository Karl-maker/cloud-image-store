import { PaymentCustomer } from "../../../domain/entities/payment.customer";

export interface PaymentCustomerService {
    /**
     * Creates a new customer in the payment system.
     * @param name - The customer's full name.
     * @param email - The customer's email address.
     * @param metadata - Optional metadata associated with the customer.
     * @returns A promise that resolves to the created customer ID.
     */
    create(name: string, email: string, metadata?: Record<string, any>): Promise<string>;

    /**
     * Deletes a customer from the payment system.
     * @param customerId - The ID of the customer to delete.
     * @returns A promise that resolves when the customer is deleted.
     */
    delete(customerId: string): Promise<void>;

    /**
     * Updates a customer's details.
     * @param customerId - The ID of the customer to update.
     * @param updates - An object containing fields to update.
     * @returns A promise that resolves to the updated customer details.
     */
    update(customerId: string, updates: { name?: string; email?: string; metadata?: Record<string, any> }): Promise<void>;

    /**
     * Finds a customer by ID and maps it to a PaymentCustomerEntity.
     * @param customerId - The ID of the customer to retrieve.
     * @returns A promise that resolves to a PaymentCustomerEntity, or null if not found.
     */
    findById(customerId: string): Promise<PaymentCustomer | null>;
}
