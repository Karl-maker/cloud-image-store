import Stripe from "stripe";
import { PaymentCustomerService } from "../../application/services/payment/interface.payment.customer.service";
import { PaymentLinkService } from "../../application/services/payment/interface.payment.link.service";
import { SubscriptionPlanService } from "../../application/services/payment/interface.subscription.plan.service";
import { SubscriptionService } from "../../application/services/payment/interface.subscription.service";
import { Subscription } from "../entities/subscription";
import { SubscriptionPlan } from "../entities/subscription.plan";
import { StripeSubscriptionService } from "../../application/services/payment/stripe.subscription.service";
import { StripePaymentLinkService } from "../../application/services/payment/stripe.payment.link.service";
import { StripeSubscriptionPlanService } from "../../application/services/payment/stripe.subscription.plan.service";
import { StripePaymentCustomer } from "../../application/services/payment/stripe.payment.customer.service";
import { eventBus } from "../../infrastructure/event/event.bus";
import { PAYMENT_INTENT_SUCCEEDED } from "../constants/event.names";


export class StripeUsecase {
    private paymentLinkService: PaymentLinkService;
    private subscriptionService: SubscriptionService;
    private subscriptionPlanService: SubscriptionPlanService;
    private paymentCustomerService: PaymentCustomerService;

    constructor(
        private stripe: Stripe,
    ) {
        this.subscriptionService = new StripeSubscriptionService(stripe);
        this.paymentLinkService = new StripePaymentLinkService(stripe);
        this.subscriptionPlanService = new StripeSubscriptionPlanService(stripe);
        this.paymentCustomerService = new StripePaymentCustomer(stripe);
    }

    async webhook (event: Stripe.Event) {
        if(event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const spaceId = paymentIntent.metadata.space_id;

            /**
             * @todo get subscription details and plan useful for the spaceId
             */

            eventBus.emit(PAYMENT_INTENT_SUCCEEDED, {
                spaceId,

            })
        }
    }

    async createPaymentLink (priceId: string, spaceId: string) : Promise<string> {
        return this.paymentLinkService.generateLink(priceId, spaceId);
    }

    async cancelSubscriptionRenewal (subscriptionId: string) : Promise<void> {
        await this.subscriptionService.cancelRenewal(subscriptionId);
    }

    async cancelSubscriptionImmediately (subscriptionId: string) : Promise<void> {
        await this.subscriptionService.cancelSubscription(subscriptionId);
    }

    async upgradeSubscription (subscriptionId: string, newPlanId: string) : Promise<Subscription> {
        return await this.subscriptionService.upgradeSubscription(subscriptionId, newPlanId);
    }

    async downgradeSubscription (subscriptionId: string, newPlanId: string) : Promise<Subscription> {
        return await this.subscriptionService.downgradeSubscription(subscriptionId, newPlanId);
    }

    async pauseSubscription (subscriptionId: string) : Promise<void> {
        await this.subscriptionService.pauseSubscription(subscriptionId);
    }

    async resumeSubscription (subscriptionId: string) : Promise<void> {
        await this.subscriptionService.resumeSubscription(subscriptionId);
    }

    async findAllSubscriptionPlans () : Promise<SubscriptionPlan[]> {
        return await this.subscriptionPlanService.findMany();
    }

    async createPaymentCustomer (name: string, email: string) : Promise<string> {
        return await this.paymentCustomerService.create(name, email);
    }

}   