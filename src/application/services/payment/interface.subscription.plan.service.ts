import { SubscriptionPlan } from "../../../domain/entities/subscription.plan";

export interface SubscriptionPlanService {
    /**
     * Creates a new subscription plan.
     * @param plan - The subscription plan details.
     * @returns A promise that resolves to the created plan ID.
     */
    create(plan: SubscriptionPlan): Promise<string>;

    /**
     * Updates an existing subscription plan.
     * @param planId - The ID of the plan to update.
     * @param updates - Partial updates to the subscription plan.
     * @returns A promise that resolves when the plan is updated.
     */
    update(planId: string, updates: Partial<SubscriptionPlan>): Promise<void>;

    /**
     * Deletes a subscription plan.
     * @param planId - The ID of the plan to delete.
     * @returns A promise that resolves when the plan is deleted.
     */
    delete(planId: string): Promise<void>;

    /**
     * Finds a subscription plan by ID.
     * @param planId - The ID of the plan to retrieve.
     * @returns A promise that resolves to the subscription plan or null if not found.
     */
    findById(planId: string): Promise<SubscriptionPlan | null>;

    /**
     * Retrieves multiple subscription plans.
     * @returns A promise that resolves to an array of subscription plans.
     */
    findMany(): Promise<SubscriptionPlan[]>;
}
