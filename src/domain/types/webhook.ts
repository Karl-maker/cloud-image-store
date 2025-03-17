export type PaymentIntentSucceededPayload = {
    spaceId: string;
    updatedItems: {
        stripeSubscriptionId: string;
        subscriptionPlanId: string;
        usersAllowed: number;
        totalMegabytes: number;
    };
}