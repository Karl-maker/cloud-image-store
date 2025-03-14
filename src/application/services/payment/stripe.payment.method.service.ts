import Stripe from 'stripe';
import { PaymentMethodService } from './interface.payment.method.service';
import { DeletePaymentMethodResult, PaymentMethodUpdate } from '../../../domain/types/payment.method';
import { PaymentMethod } from '../../../domain/entities/payment.method';

export class StripePaymentMethodService implements PaymentMethodService {
    private stripe: Stripe;

    /**
     * Constructor to initialize the Stripe instance.
     * @param stripe - An instance of the Stripe SDK.
     */
    constructor(stripe: Stripe) {
        this.stripe = stripe;
    }

    /**
     * Adds a new payment method for a customer.
     * @param customerId - The ID of the customer.
     * @param paymentMethodDetails - The details of the payment method to add.
     * @returns The added payment method.
     */
    async addPaymentMethod(customerId: string, paymentMethodDetails: Record<string, any>): Promise<PaymentMethod> {
        try {
            // Attach the payment method to the customer
            const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodDetails.id, {
                customer: customerId,
            });

            // Optionally, set this payment method as the default for the customer
            if (paymentMethodDetails.isDefault) {
                await this.stripe.customers.update(customerId, {
                    invoice_settings: {
                        default_payment_method: paymentMethod.id,
                    },
                });
            }

            return this.mapStripePaymentMethodToPaymentMethod(paymentMethod, customerId);
        } catch (error) {
            throw new Error(`Failed to add payment method: ${(error as any).message ?? error}`);
        }
    }

    /**
     * Deletes a payment method.
     * @param paymentMethodId - The ID of the payment method to delete.
     * @returns The result of the deletion operation.
     */
    async deletePaymentMethod(paymentMethodId: string): Promise<DeletePaymentMethodResult> {
        try {
            await this.stripe.paymentMethods.detach(paymentMethodId);
            return {
                id: paymentMethodId,
                success: true,
                message: 'Payment method successfully deleted.',
            };
        } catch (error) {
            return {
                id: paymentMethodId,
                success: false,
                message: `Failed to delete payment method: ${(error as any).message ?? error}`,
            };
        }
    }

    /**
     * Updates a payment method.
     * @param paymentMethodId - The ID of the payment method to update.
     * @param updates - The updates to apply to the payment method.
     * @returns The updated payment method.
     */
    async updatePaymentMethod(paymentMethodId: string, updates: PaymentMethodUpdate): Promise<PaymentMethod> {
        try {
            const expMonth = updates.expirationDate ? updates.expirationDate.getMonth() + 1 : undefined; // Months are 0-indexed in JavaScript, so adding 1
            const expYear = updates.expirationDate ? updates.expirationDate.getFullYear() : undefined; // Gets the full year
            
            const stripeUpdateParams: Stripe.PaymentMethodUpdateParams = {
                billing_details: {
                    name: updates.name,
                    email: updates.email,
                    phone: updates.phone,
                    address: updates.address
                },
                card: {
                    exp_month: expMonth,
                    exp_year: expYear,
                }
            };
            

            const paymentMethod = await this.stripe.paymentMethods.update(paymentMethodId, stripeUpdateParams);
            return this.mapStripePaymentMethodToPaymentMethod(paymentMethod);
        } catch (error) {
            throw new Error(`Failed to update payment method: ${(error as any).message ?? error}`);
        }
    }

    /**
     * Retrieves payment methods associated with a specific customer.
     * @param customerId - The ID of the customer.
     * @returns A list of payment methods.
     */
    async getPaymentMethodsByCustomer(customerId: string): Promise<PaymentMethod[]> {
        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: 'card',
            });

            return paymentMethods.data.map(pm => this.mapStripePaymentMethodToPaymentMethod(pm, customerId));
        } catch (error: unknown) {
            throw new Error(`Failed to retrieve payment methods: ${(error as any).message ?? error}`);
        }
    }

    /**
     * Maps a Stripe PaymentMethod object to our PaymentMethod interface.
     * @param stripePaymentMethod - The Stripe PaymentMethod object.
     * @param customerId - The ID of the customer.
     * @returns A PaymentMethod object.
     */
    private mapStripePaymentMethodToPaymentMethod(
        stripePaymentMethod: Stripe.PaymentMethod,
        customerId?: string
    ): PaymentMethod {
        return {
            id: stripePaymentMethod.id,
            customerId: customerId || stripePaymentMethod.customer?.toString() || '',
            type: stripePaymentMethod.type,
            isDefault: typeof stripePaymentMethod.customer !== 'string'
                ? stripePaymentMethod.customer?.invoice_settings?.default_payment_method === stripePaymentMethod.id
                : false,
            lastFourDigits: stripePaymentMethod.card?.last4,
            expirationDate: stripePaymentMethod.card?.exp_month && stripePaymentMethod.card?.exp_year
                ? new Date(`${stripePaymentMethod.card.exp_year}-${String(stripePaymentMethod.card.exp_month).padStart(2, '0')}-01`)
                : undefined,
            brand: stripePaymentMethod.card?.brand,
            country: stripePaymentMethod.card?.country!,
            createdAt: stripePaymentMethod.created ? new Date(stripePaymentMethod.created * 1000) : new Date(), // Assuming `created` is in seconds
            updatedAt: stripePaymentMethod.created ? new Date(stripePaymentMethod.created * 1000) : new Date(), // Assuming `updated` is in seconds
        };      
    }
    
}