import { PaymentMethod } from "../../../domain/entities/payment.method";
import { DeletePaymentMethodResult, PaymentMethodUpdate } from "../../../domain/types/payment.method";

/**
 * Interface for managing payment methods.
 */
export interface PaymentMethodService {
    /**
     * Adds a new payment method for a customer.
     * @param customerId - The ID of the customer.
     * @param paymentMethodDetails - The details of the payment method to add.
     * @returns The added payment method.
     */
    addPaymentMethod(customerId: string, paymentMethodDetails: Record<string, any>): Promise<PaymentMethod>;

    /**
     * Deletes a payment method.
     * @param paymentMethodId - The ID of the payment method to delete.
     * @returns The result of the deletion operation.
     */
    deletePaymentMethod(paymentMethodId: string): Promise<DeletePaymentMethodResult>;

    /**
     * Updates a payment method.
     * @param paymentMethodId - The ID of the payment method to update.
     * @param updates - The updates to apply to the payment method.
     * @returns The updated payment method.
     */
    updatePaymentMethod(paymentMethodId: string, updates: PaymentMethodUpdate): Promise<PaymentMethod>;

    /**
     * Retrieves payment methods associated with a specific customer.
     * @param customerId - The ID of the customer.
     * @returns A list of payment methods.
     */
    getPaymentMethodsByCustomer(customerId: string): Promise<PaymentMethod[]>;
}
