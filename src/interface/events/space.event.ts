import Stripe from "stripe";
import { STRIPE_KEY } from "../../application/configuration";
import { StripeSubscriptionService } from "../../application/services/payment/stripe.subscription.service";
import { SPACE_DELETED } from "../../domain/constants/event.names";
import { Space } from "../../domain/entities/space";
import { eventBus } from "../../infrastructure/event/event.bus";

eventBus.on<{ space: Space }>(SPACE_DELETED, async ({ space } : { space: Space }) => {
    try { 
        if(!space.stripeSubscriptionId) return;
        const stripeSubscriptionService = new StripeSubscriptionService(new Stripe(STRIPE_KEY!, { apiVersion: '2025-02-24.acacia' }))
        stripeSubscriptionService.cancelSubscription(space.stripeSubscriptionId);
    } catch(err) {}
});