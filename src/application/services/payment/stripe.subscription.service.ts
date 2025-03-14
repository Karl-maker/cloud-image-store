import Stripe from 'stripe';
import { Subscription } from "../../../domain/entities/subscription";
import { Persistent } from "../../../domain/entities/persistent";
import { SubscriptionService } from './interface.subscription.service';

// Update: Accept Stripe object via constructor
export class StripeSubscriptionService implements SubscriptionService {
    private stripe: Stripe;

    constructor(stripe: Stripe) {
        this.stripe = stripe;
    }

    /**
     * Creates a new subscription for a user.
     * @param customerId - The ID of the customer.
     * @param planId - The ID of the subscription plan.
     * @returns A promise that resolves to the created subscription details.
     */
    async createSubscription(customerId: string, planId: string): Promise<Subscription> {
        const stripeSubscription = await this.stripe.subscriptions.create({
            customer: customerId,
            items: [{ plan: planId }],
            expand: ['latest_invoice.payment_intent'],
        });

        return this.mapStripeToSubscription(stripeSubscription);
    }

    /**
     * Pauses an active subscription.
     * @param subscriptionId - The ID of the subscription to pause.
     * @returns A promise that resolves when the subscription is paused.
     */
    async pauseSubscription(subscriptionId: string): Promise<void> {
        await this.stripe.subscriptions.update(subscriptionId, {
            pause_collection: { behavior: 'void' },
        });
    }

    /**
     * Cancels the automatic renewal of a subscription.
     * @param subscriptionId - The ID of the subscription to cancel renewal for.
     * @returns A promise that resolves when the renewal is canceled.
     */
    async cancelRenewal(subscriptionId: string): Promise<void> {
        await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
    }

    /**
     * Cancels a subscription and processes a refund based on usage.
     * @param subscriptionId - The ID of the subscription to cancel.
     * @returns A promise that resolves to the refund amount.
     */
    async cancelSubscription(subscriptionId: string): Promise<number> {
        // Retrieve the subscription
        const stripeSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    
        // Retrieve the latest invoice for the subscription
        const latestInvoice = await this.stripe.invoices.retrieve(stripeSubscription.latest_invoice as string);
    
        // Get the payment intent from the invoice
        const paymentIntentId = latestInvoice.payment_intent as string;
        if (!paymentIntentId) {
            throw new Error("No payment intent found for the subscription.");
        }
    
        // Calculate the refund amount (prorated based on remaining time)
        const amountPaid = latestInvoice.total;
        const currentPeriodEnd = stripeSubscription.current_period_end;
        const timeRemaining = currentPeriodEnd - Math.floor(Date.now() / 1000);
    
        const totalPeriod = currentPeriodEnd - stripeSubscription.current_period_start;
        const refundAmount = Math.floor((amountPaid * timeRemaining) / totalPeriod);
    
        // Issue the refund
        const refund = await this.stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: refundAmount,
        });
    
        return refund.amount / 100; // Convert from cents to dollars
    }    

    /**
     * Upgrades a subscription to a higher-tier plan.
     * @param subscriptionId - The ID of the subscription to upgrade.
     * @param newPlanId - The ID of the new plan to upgrade to.
     * @returns A promise that resolves to the updated subscription details.
     */
    async upgradeSubscription(subscriptionId: string, newPlanId: string): Promise<Subscription> {
        // Retrieve the existing subscription
        const existingSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    
        // Ensure there's at least one item in the subscription
        if (!existingSubscription.items.data.length) {
            throw new Error("Subscription has no associated items.");
        }
    
        // Update the subscription with the new plan
        const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
            items: [{ id: existingSubscription.items.data[0].id, price: newPlanId }],
        });
    
        return this.mapStripeToSubscription(updatedSubscription);
    }
    
    /**
     * Downgrades a subscription to a lower-tier plan.
     * @param subscriptionId - The ID of the subscription to downgrade.
     * @param newPlanId - The ID of the new plan to downgrade to.
     * @returns A promise that resolves to the updated subscription details.
     */
    async downgradeSubscription(subscriptionId: string, newPlanId: string): Promise<Subscription> {
        // Retrieve the existing subscription
        const existingSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    
        // Ensure there's at least one item in the subscription
        if (!existingSubscription.items.data.length) {
            throw new Error("Subscription has no associated items.");
        }
    
        // Update the subscription with the new plan
        const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
            items: [{ id: existingSubscription.items.data[0].id, price: newPlanId }],
        });
    
        return this.mapStripeToSubscription(updatedSubscription);
    }
    

    /**
     * Resumes a paused subscription.
     * @param subscriptionId - The ID of the subscription to resume.
     * @returns A promise that resolves when the subscription is resumed.
     */
    async resumeSubscription(subscriptionId: string): Promise<Subscription> {
        const stripeSubscription = await this.stripe.subscriptions.update(subscriptionId, {
            pause_collection: null,  // Remove pause collection to resume the subscription
        });

        return this.mapStripeToSubscription(stripeSubscription);
    }

    /**
     * Maps a Stripe subscription object to a domain Subscription entity.
     * @param stripeSubscription - The Stripe subscription object.
     * @returns The mapped Subscription entity.
     */
    private mapStripeToSubscription(stripeSubscription: Stripe.Subscription): Subscription {
        return {
            id: stripeSubscription.id,
            customerId: stripeSubscription.customer as string,
            planId: stripeSubscription.items.data[0].plan.id,
            status: stripeSubscription.status as 'active' | 'paused' | 'canceled',
            startDate: new Date(stripeSubscription.start_date * 1000),
            endDate: new Date(stripeSubscription.current_period_end * 1000),
            autoRenew: stripeSubscription.cancel_at_period_end === false,
            createdAt: new Date(stripeSubscription.created * 1000),
            updatedAt: new Date(stripeSubscription.created * 1000),
        };
    }
}
