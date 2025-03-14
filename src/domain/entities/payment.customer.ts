import { Persistent } from "./persistent";

export interface PaymentCustomer extends Persistent {
    name: string;
    email: string;
    metadata?: Record<string, any>;
}
