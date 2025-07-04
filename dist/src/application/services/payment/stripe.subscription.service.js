"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeSubscriptionService = void 0;
// Update: Accept Stripe object via constructor
class StripeSubscriptionService {
    constructor(stripe) {
        this.stripe = stripe;
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sub = yield this.stripe.subscriptions.retrieve(id);
            return sub ? this.mapStripeToSubscription(sub) : null;
        });
    }
    /**
     * Creates a new subscription for a user.
     * @param customerId - The ID of the customer.
     * @param planId - The ID of the subscription plan.
     * @returns A promise that resolves to the created subscription details.
     */
    createSubscription(customerId, planId, trialDays) {
        return __awaiter(this, void 0, void 0, function* () {
            const trialEnd = trialDays ? Math.floor(Date.now() / 1000) + trialDays * 86400 : 'now';
            const stripeSubscription = yield this.stripe.subscriptions.create({
                customer: customerId,
                items: [{ plan: planId }],
                expand: ['latest_invoice.payment_intent'],
                trial_end: trialEnd
            });
            return this.mapStripeToSubscription(stripeSubscription);
        });
    }
    /**
     * Pauses an active subscription.
     * @param subscriptionId - The ID of the subscription to pause.
     * @returns A promise that resolves when the subscription is paused.
     */
    pauseSubscription(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stripe.subscriptions.update(subscriptionId, {
                pause_collection: { behavior: 'void' },
            });
        });
    }
    /**
     * Cancels the automatic renewal of a subscription.
     * @param subscriptionId - The ID of the subscription to cancel renewal for.
     * @returns A promise that resolves when the renewal is canceled.
     */
    cancelRenewal(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
            });
        });
    }
    /**
     * Cancels a subscription and processes a refund based on usage.
     * @param subscriptionId - The ID of the subscription to cancel.
     * @returns A promise that resolves to the refund amount.
     */
    cancelSubscription(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve the subscription
            const stripeSubscription = yield this.stripe.subscriptions.retrieve(subscriptionId);
            // Retrieve the latest invoice for the subscription
            const latestInvoice = yield this.stripe.invoices.retrieve(stripeSubscription.latest_invoice);
            // Get the payment intent from the invoice
            const paymentIntentId = latestInvoice.payment_intent;
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
            const refund = yield this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: refundAmount,
            });
            // Cancel the subscription
            yield this.stripe.subscriptions.cancel(subscriptionId);
            return refund.amount / 100; // Convert from cents to dollars
        });
    }
    /**
     * Upgrades a subscription to a higher-tier plan.
     * @param subscriptionId - The ID of the subscription to upgrade.
     * @param newPlanId - The ID of the new plan to upgrade to.
     * @returns A promise that resolves to the updated subscription details.
     */
    upgradeSubscription(subscriptionId, newPriceId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve the existing subscription
            const existingSubscription = yield this.stripe.subscriptions.retrieve(subscriptionId);
            // Ensure there's at least one item in the subscription
            if (!existingSubscription.items.data.length) {
                throw new Error("Subscription has no associated items.");
            }
            // Update the subscription with the new plan
            const updatedSubscription = yield this.stripe.subscriptions.update(subscriptionId, {
                items: [{ id: existingSubscription.items.data[0].id, price: newPriceId }],
            });
            return this.mapStripeToSubscription(updatedSubscription);
        });
    }
    /**
     * Downgrades a subscription to a lower-tier plan.
     * @param subscriptionId - The ID of the subscription to downgrade.
     * @param newPlanId - The ID of the new plan to downgrade to.
     * @returns A promise that resolves to the updated subscription details.
     */
    downgradeSubscription(subscriptionId, newPlanId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve the existing subscription
            const existingSubscription = yield this.stripe.subscriptions.retrieve(subscriptionId);
            // Ensure there's at least one item in the subscription
            if (!existingSubscription.items.data.length) {
                throw new Error("Subscription has no associated items.");
            }
            // Update the subscription with the new plan
            const updatedSubscription = yield this.stripe.subscriptions.update(subscriptionId, {
                items: [{ id: existingSubscription.items.data[0].id, price: newPlanId }],
            });
            return this.mapStripeToSubscription(updatedSubscription);
        });
    }
    /**
     * Resumes a paused subscription.
     * @param subscriptionId - The ID of the subscription to resume.
     * @returns A promise that resolves when the subscription is resumed.
     */
    resumeSubscription(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stripeSubscription = yield this.stripe.subscriptions.update(subscriptionId, {
                pause_collection: null, // Remove pause collection to resume the subscription
            });
            return this.mapStripeToSubscription(stripeSubscription);
        });
    }
    /**
     * Maps a Stripe subscription object to a domain Subscription entity.
     * @param stripeSubscription - The Stripe subscription object.
     * @returns The mapped Subscription entity.
     */
    mapStripeToSubscription(stripeSubscription) {
        return {
            id: stripeSubscription.id,
            customerId: stripeSubscription.customer,
            planId: stripeSubscription.items.data[0].plan.product,
            status: stripeSubscription.status,
            startDate: new Date(stripeSubscription.start_date * 1000),
            endDate: new Date(stripeSubscription.current_period_end * 1000),
            autoRenew: stripeSubscription.cancel_at_period_end === false,
            createdAt: new Date(stripeSubscription.created * 1000),
            updatedAt: new Date(stripeSubscription.created * 1000),
            trial: stripeSubscription.trial_end !== null ? new Date(stripeSubscription.trial_end * 1000) : undefined
        };
    }
}
exports.StripeSubscriptionService = StripeSubscriptionService;
