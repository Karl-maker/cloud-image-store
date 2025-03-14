
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