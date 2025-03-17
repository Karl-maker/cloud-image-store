import { Subscription } from "../../../domain/entities/subscription";

export interface SubscriptionService {
    /**
     * Creates a new subscription for a user.
     * @param customerId - The ID of the customer.
     * @param planId - The ID of the subscription plan.
     * @returns A promise that resolves to the created subscription details.
     */
    createSubscription(customerId: string, planId: string, trialDays?: number): Promise<Subscription>;

    /**
     * Pauses an active subscription.
     * @param subscriptionId - The ID of the subscription to pause.
     * @returns A promise that resolves when the subscription is paused.
     */
    pauseSubscription(subscriptionId: string): Promise<void>;

    /**
     * Cancels the automatic renewal of a subscription.
     * @param subscriptionId - The ID of the subscription to cancel renewal for.
     * @returns A promise that resolves when the renewal is canceled.
     */
    cancelRenewal(subscriptionId: string): Promise<void>;

    /**
     * Resumes the automatic renewal of a subscription.
     * @param subscriptionId - The ID of the subscription to resume renewal for.
     * @returns A subscription entity that resolves when the renewal is resumed.
     */

    resumeSubscription(subscriptionId: string): Promise<Subscription>;

    /**
     * Cancels a subscription and processes a refund based on usage.
     * @param subscriptionId - The ID of the subscription to cancel.
     * @returns A promise that resolves to the refund amount.
     */
    cancelSubscription(subscriptionId: string): Promise<number>;

    /**
     * Upgrades a subscription to a higher-tier plan.
     * @param subscriptionId - The ID of the subscription to upgrade.
     * @param newPlanId - The ID of the new plan to upgrade to.
     * @returns A promise that resolves to the updated subscription details.
     */
    upgradeSubscription(subscriptionId: string, newPlanId: string): Promise<Subscription>;

    /**
     * Downgrades a subscription to a lower-tier plan.
     * @param subscriptionId - The ID of the subscription to downgrade.
     * @param newPlanId - The ID of the new plan to downgrade to.
     * @returns A promise that resolves to the updated subscription details.
     */
    downgradeSubscription(subscriptionId: string, newPlanId: string): Promise<Subscription>;

    findById(id: string) : Promise<Subscription | null>
}