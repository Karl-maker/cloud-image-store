import Stripe from 'stripe';
import { PaymentCustomer } from '../../../domain/entities/payment.customer';
import { PaymentCustomerService } from './interface.payment.customer.service';

export class StripePaymentCustomer implements PaymentCustomerService {
    private stripe: Stripe;

    constructor(stripe: Stripe) {
        this.stripe = stripe;
    }

    async create(name: string, email: string, metadata?: Record<string, any>): Promise<string> {
        const customer = await this.stripe.customers.create({
            name,
            email,
            metadata,
        });
        return customer.id;
    }

    async delete(customerId: string): Promise<void> {
        await this.stripe.customers.del(customerId);
    }

    async update(
        customerId: string,
        updates: { name?: string; email?: string; metadata?: Record<string, any> }
    ): Promise<void> {
        await this.stripe.customers.update(customerId, updates);
    }

    async findById(customerId: string): Promise<PaymentCustomer | null> {
        try {
            const customer = await this.stripe.customers.retrieve(customerId);

            // Stripe API might return a deleted customer as an object with `deleted: true`
            if ((customer as Stripe.DeletedCustomer).deleted) {
                return null;
            }

            return this.mapStripeCustomer(customer as Stripe.Customer);
        } catch (error: any) {
            if (error.type === 'StripeInvalidRequestError') {
                return null; // Customer not found
            }
            throw error;
        }
    }

    private mapStripeCustomer(customer: Stripe.Customer): PaymentCustomer {
        return {
            id: customer.id,
            name: customer.name || '',
            email: customer.email || '',
            metadata: customer.metadata,
            createdAt: new Date(customer.created * 1000),
            updatedAt: new Date(customer.created * 1000),
        };
    }
}
