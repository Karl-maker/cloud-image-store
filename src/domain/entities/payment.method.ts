import { Persistent } from "./persistent";

export interface PaymentMethod extends Persistent{
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