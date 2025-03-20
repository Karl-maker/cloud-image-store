import Stripe from "stripe";
import { SubscriptionPlan } from "../../../domain/entities/subscription.plan";
import { Feature, Price } from "../../../domain/types/common";
import { SubscriptionPlanService } from "./interface.subscription.plan.service";

export class StripeSubscriptionPlanService implements SubscriptionPlanService {
    private stripe: Stripe;

    constructor(stripeInstance: Stripe) {
        this.stripe = stripeInstance;
    }

    /**
     * Creates a new subscription plan in Stripe along with its prices.
     * @param plan - The subscription plan details.
     * @returns A promise that resolves to the created plan ID.
     */
    async create(plan: SubscriptionPlan): Promise<string> {
        const stripeProduct = await this.stripe.products.create({
            name: plan.name,
            description: plan.description,
            metadata: {
                megabytes: plan.megabytes.toString(),
                features: JSON.stringify(plan.features),
                users: plan.users.toString(),
            },
        });

        const stripePrices = await Promise.all(
            plan.prices.map((price) => 
                this.stripe.prices.create({
                    unit_amount: price.amount, 
                    currency: price.currency,
                    recurring: { interval: price.period, interval_count: price.frequency },
                    product: stripeProduct.id,
                })
            )
        );

        return stripeProduct.id;
    }

    /**
     * Updates an existing subscription plan and its prices.
     * @param planId - The ID of the plan to update.
     * @param updates - Partial updates to the subscription plan.
     */
    async update(planId: string, updates: Partial<SubscriptionPlan>): Promise<void> {
        const existingProduct = await this.stripe.products.retrieve(planId);
        if (!existingProduct) throw new Error(`Subscription plan with ID ${planId} not found.`);

        // Update the product details
        await this.stripe.products.update(planId, {
            name: updates.name ?? existingProduct.name,
            description: updates.description ?? existingProduct.description,
            metadata: {
                megabytes: updates.megabytes?.toString() ?? existingProduct.metadata.megabytes,
                features: updates.features ? JSON.stringify(updates.features) : existingProduct.metadata.features,
            },
        });

        if (updates.prices) {
            // Retrieve existing prices and delete them (deep update)
            const existingPrices = await this.stripe.prices.list({ product: planId });
            await Promise.all(existingPrices.data.map((price) => this.stripe.prices.update(price.id, { active: false })));

            // Create new prices
            await Promise.all(
                updates.prices.map((price: Price) =>
                    this.stripe.prices.create({
                        unit_amount: price.amount * 100,
                        currency: price.currency,
                        recurring: { interval: price.period, interval_count: price.frequency },
                        product: planId,
                    })
                )
            );
        }
    }

    /**
     * Deletes a subscription plan and its associated prices.
     * @param planId - The ID of the plan to delete.
     */
    async delete(planId: string): Promise<void> {
        // Retrieve existing prices
        const prices = await this.stripe.prices.list({ product: planId });

        // Mark prices as inactive
        await Promise.all(prices.data.map((price) => this.stripe.prices.update(price.id, { active: false })));

        // Delete the product
        await this.stripe.products.update(planId, { active: false });
    }

    /**
     * Retrieves a subscription plan by ID and maps it to a SubscriptionPlan entity.
     * @param planId - The ID of the plan to retrieve.
     * @returns A promise that resolves to the subscription plan or null if not found.
     */
    async findById(planId: string): Promise<SubscriptionPlan | null> {
        try {
            const product = await this.stripe.products.retrieve(planId);
            const prices = await this.stripe.prices.list({ product: planId });

            return this.mapStripeToSubscriptionPlan(product, prices.data);
        } catch (error) {
            if ((error as Stripe.errors.StripeError).code === "resource_missing") {
                return null;
            }
            throw error;
        }
    }

    /**
     * Retrieves multiple subscription plans.
     * @returns A promise that resolves to an array of subscription plans.
     */
    async findMany(): Promise<SubscriptionPlan[]> {
        const products = await this.stripe.products.list({ active: true });
        const subscriptionPlans: SubscriptionPlan[] = [];

        for (const product of products.data) {
            const prices = await this.stripe.prices.list({ product: product.id });
            subscriptionPlans.push(this.mapStripeToSubscriptionPlan(product, prices.data));
        }

        return subscriptionPlans;
    }

    /**
     * Maps a Stripe product and its prices to a SubscriptionPlan entity.
     * @param product - The Stripe product object.
     * @param prices - The Stripe prices associated with the product.
     * @returns A SubscriptionPlan entity.
     */
    public mapStripeToSubscriptionPlan(
        product: Stripe.Product,
        prices: Stripe.Price[]
    ): SubscriptionPlan {
        return {
            id: product.id,
            name: product.name,
            description: product.description ?? "",
            megabytes: parseInt(product.metadata.megabytes) || 0,
            users: parseInt(product.metadata.users) || 1,
            features: JSON.parse(product.metadata.features || "[]") as Feature[],
            prices: prices.map((price) => ({
                id: price.id,
                period: price.recurring?.interval as "day" | "week" | "month" | "year",
                frequency: price.recurring?.interval_count || 1,
                amount: price.unit_amount ?? 0, 
                currency: price.currency as "usd" | "euro",
            })),
            createdAt: new Date(product.created * 1000),
            updatedAt: new Date(product.updated * 1000),
        };
    }
}
