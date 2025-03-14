export interface PaymentMethod {
    id: string;
    customerId: string;
    name?: string;
    address?: {
        state: string | undefined,
        city: string,
        country: string,
        postal_code: string,
        line1: string,
        line2: string
    };
    email?: string;
    type: string;
    phone?: string;
    isDefault?: boolean;
    lastFourDigits?: string;  // e.g., last 4 digits of the card
    expirationDate?: Date;  // Expiration date for cards
    brand?: string;           // Brand of the card (e.g., Visa, MasterCard)
    country?: string;         // Country of the payment method
}

/**
 * Result of a deletion operation on a payment method.
 */
export interface DeletePaymentMethodResult {
    id: string;
    success: boolean;
    message?: string;
}

/**
 * Data structure for updating a payment method.
 */
export interface PaymentMethodUpdate {
    type?: string;
    isDefault?: boolean;
    lastFourDigits?: string;
    expirationDate?: Date;
    brand?: string;
    country?: string;
    email?: string;
    phone?: string;
    name?: string;
    address?: {
        state: string | undefined,
        city: string,
        country: string,
        postal_code: string,
        line1: string,
        line2: string
    }
}

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
