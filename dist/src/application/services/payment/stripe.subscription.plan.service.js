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
exports.StripeSubscriptionPlanService = void 0;
class StripeSubscriptionPlanService {
    constructor(stripeInstance) {
        this.stripe = stripeInstance;
    }
    /**
     * Creates a new subscription plan in Stripe along with its prices.
     * @param plan - The subscription plan details.
     * @returns A promise that resolves to the created plan ID.
     */
    create(plan) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const stripeProduct = yield this.stripe.products.create({
                name: plan.name,
                description: plan.description,
                metadata: {
                    megabytes: plan.megabytes.toString(),
                    features: JSON.stringify(plan.features),
                    users: plan.users.toString(),
                    highlighted: Number(plan.highlighted),
                    aiGenerationsPerMonth: Number((_a = plan.aiGenerationsPerMonth) !== null && _a !== void 0 ? _a : 0),
                    spaces: Number((_b = plan.spaces) !== null && _b !== void 0 ? _b : 0),
                },
            });
            const stripePrices = yield Promise.all(plan.prices.map((price) => {
                const priceData = {
                    unit_amount: price.amount,
                    currency: price.currency,
                    product: stripeProduct.id,
                };
                // Only add recurring configuration if the price is marked as recurring
                if (price.recurring && price.period && price.frequency) {
                    priceData.recurring = {
                        interval: price.period,
                        interval_count: price.frequency
                    };
                }
                return this.stripe.prices.create(priceData);
            }));
            return stripeProduct.id;
        });
    }
    /**
     * Updates an existing subscription plan and its prices.
     * @param planId - The ID of the plan to update.
     * @param updates - Partial updates to the subscription plan.
     */
    update(planId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const existingProduct = yield this.stripe.products.retrieve(planId);
            if (!existingProduct)
                throw new Error(`Subscription plan with ID ${planId} not found.`);
            // Update the product details
            yield this.stripe.products.update(planId, {
                name: (_a = updates.name) !== null && _a !== void 0 ? _a : existingProduct.name,
                description: (_b = updates.description) !== null && _b !== void 0 ? _b : existingProduct.description,
                metadata: {
                    spaces: updates.spaces ? Number(updates.spaces) : existingProduct.metadata.spaces,
                    megabytes: (_d = (_c = updates.megabytes) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : existingProduct.metadata.megabytes,
                    features: updates.features ? JSON.stringify(updates.features) : existingProduct.metadata.features,
                    highlighted: updates.highlighted ? Number(updates.highlighted) : existingProduct.metadata.highlighted,
                    aiGenerationsPerMonth: updates.aiGenerationsPerMonth ? Number(updates.aiGenerationsPerMonth) : (_e = existingProduct.metadata.aiGenerationsPerMonth) !== null && _e !== void 0 ? _e : 0
                },
            });
            if (updates.prices) {
                // Retrieve existing prices and delete them (deep update)
                const existingPrices = yield this.stripe.prices.list({ product: planId });
                yield Promise.all(existingPrices.data.map((price) => this.stripe.prices.update(price.id, { active: false })));
                // Create new prices
                yield Promise.all(updates.prices.map((price) => {
                    const priceData = {
                        unit_amount: price.amount * 100,
                        currency: price.currency,
                        product: planId,
                    };
                    // Only add recurring configuration if the price is marked as recurring
                    if (price.recurring && price.period && price.frequency) {
                        priceData.recurring = {
                            interval: price.period,
                            interval_count: price.frequency
                        };
                    }
                    return this.stripe.prices.create(priceData);
                }));
            }
        });
    }
    /**
     * Deletes a subscription plan and its associated prices.
     * @param planId - The ID of the plan to delete.
     */
    delete(planId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve existing prices
            const prices = yield this.stripe.prices.list({ product: planId });
            // Mark prices as inactive
            yield Promise.all(prices.data.map((price) => this.stripe.prices.update(price.id, { active: false })));
            // Delete the product
            yield this.stripe.products.update(planId, { active: false });
        });
    }
    /**
     * Retrieves a subscription plan by ID and maps it to a SubscriptionPlan entity.
     * @param planId - The ID of the plan to retrieve.
     * @returns A promise that resolves to the subscription plan or null if not found.
     */
    findById(planId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield this.stripe.products.retrieve(planId);
                const prices = yield this.stripe.prices.list({ product: planId });
                return this.mapStripeToSubscriptionPlan(product, prices.data);
            }
            catch (error) {
                if (error.code === "resource_missing") {
                    return null;
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves multiple subscription plans.
     * @returns A promise that resolves to an array of subscription plans.
     */
    findMany() {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield this.stripe.products.list({ active: true });
            const subscriptionPlans = [];
            for (const product of products.data) {
                const prices = yield this.stripe.prices.list({ product: product.id });
                subscriptionPlans.push(this.mapStripeToSubscriptionPlan(product, prices.data));
            }
            return subscriptionPlans;
        });
    }
    /**
     * Maps a Stripe product and its prices to a SubscriptionPlan entity.
     * @param product - The Stripe product object.
     * @param prices - The Stripe prices associated with the product.
     * @returns A SubscriptionPlan entity.
     */
    mapStripeToSubscriptionPlan(product, prices) {
        var _a, _b;
        return {
            id: product.id,
            name: product.name,
            description: (_a = product.description) !== null && _a !== void 0 ? _a : "",
            megabytes: parseInt(product.metadata.megabytes) || 0,
            users: parseInt(product.metadata.users) || 1,
            features: JSON.parse(product.metadata.features || "[]"),
            prices: prices.map((price) => {
                var _a, _b, _c;
                return ({
                    id: price.id,
                    period: (_a = price.recurring) === null || _a === void 0 ? void 0 : _a.interval,
                    frequency: ((_b = price.recurring) === null || _b === void 0 ? void 0 : _b.interval_count) || undefined,
                    amount: (_c = price.unit_amount) !== null && _c !== void 0 ? _c : 0,
                    currency: price.currency,
                    recurring: !!price.recurring,
                });
            }),
            createdAt: new Date(product.created * 1000),
            updatedAt: new Date(product.updated * 1000),
            spaces: product.metadata.spaces ? Number(product.metadata.spaces) : 0,
            highlighted: (_b = Boolean(Number(product.metadata.highlighted))) !== null && _b !== void 0 ? _b : false,
            aiGenerationsPerMonth: product.metadata.aiGenerationsPerMonth ? Number(product.metadata.aiGenerationsPerMonth) : 0
        };
    }
}
exports.StripeSubscriptionPlanService = StripeSubscriptionPlanService;
