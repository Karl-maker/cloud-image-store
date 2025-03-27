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
import { PAYMENT_INTENT_SUCCEEDED, SPACE_SUBSCRIBED_TO_PLAN } from "../constants/event.names";
import { EventBus } from "../../infrastructure/event/event.bus";
import { PaymentIntentSucceededPayload } from "../types/webhook";
import { SpaceUsecase } from "./space.usecase";
import { NotFoundException } from "../../application/exceptions/not.found";


export class StripeUsecase {
    private paymentLinkService: PaymentLinkService;
    private subscriptionService: SubscriptionService;
    private subscriptionPlanService: SubscriptionPlanService;
    private paymentCustomerService: PaymentCustomerService;

    constructor(
        public stripe: Stripe,
        private spaceUsecase: SpaceUsecase
    ) {
        this.subscriptionService = new StripeSubscriptionService(stripe);
        this.paymentLinkService = new StripePaymentLinkService(stripe);
        this.subscriptionPlanService = new StripeSubscriptionPlanService(stripe);
        this.paymentCustomerService = new StripePaymentCustomer(stripe);
    }

    async webhook (event: Stripe.Event, eventBus: EventBus) : Promise<void>{
        if(event.type === 'customer.subscription.created') {
            const customerSubscription = event.data.object as Stripe.Subscription;

            if(!customerSubscription.metadata.space_id) throw new Error('no space id found')

            const spaceId = customerSubscription.metadata.space_id;

            let payload : PaymentIntentSucceededPayload = {
                spaceId,
                updatedItems: {
                    stripeSubscriptionId: "",
                    subscriptionPlanId: "",
                    usersAllowed: 0,
                    totalMegabytes: 0
                }
            }

            const subscription = await this.subscriptionService.findById(customerSubscription.id as string);
            
            if(!subscription) throw new Error('no subscription found');

            payload.updatedItems.stripeSubscriptionId = subscription.id!;
            payload.updatedItems.subscriptionPlanId = subscription.planId;
            
            const plan = await this.subscriptionPlanService.findById(subscription.planId);

            if(!plan)  throw new Error('no plan found');

            payload.updatedItems.totalMegabytes = plan.megabytes;
            payload.updatedItems.usersAllowed = plan.users;

            const result = await this.spaceUsecase.subscribedToPlan(payload.spaceId, subscription, plan);

            if(result instanceof Error || result instanceof NotFoundException) throw result;

            eventBus.emit(PAYMENT_INTENT_SUCCEEDED, payload)
            eventBus.emit(SPACE_SUBSCRIBED_TO_PLAN, { plan, space: result })
        } else if(event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            const result = await this.spaceUsecase.subscriptionEnd(subscription.id);
            if(result instanceof Error || result instanceof NotFoundException) throw result;
        } else if(event.type === 'customer.subscription.paused') {
            const subscription = event.data.object as Stripe.Subscription;
            const result = await this.spaceUsecase.subscriptionPaused(subscription.id);
            if(result instanceof Error || result instanceof NotFoundException) throw result;
        } else if(event.type === 'customer.subscription.resumed') {
            const subscription = event.data.object as Stripe.Subscription;
            const result = await this.spaceUsecase.subscriptionResumed(subscription.id);
            if(result instanceof Error || result instanceof NotFoundException) throw result;
        } else if(event.type === 'customer.subscription.updated') {
            const subscription = event.data.object;
            const planId = subscription.items.data[0].plan.product as string;
            const plan = await this.subscriptionPlanService.findById(planId);

            if(!plan) throw new Error('no plan found');
            if(!subscription.metadata.space_id) throw new Error('no space id found')
                
            const space = await this.spaceUsecase.findById(subscription.metadata.space_id);
            const subscriptionEntity = await this.subscriptionService.findById(subscription.id as string);

            if(space instanceof Error || space instanceof NotFoundException) throw space;
            if(subscriptionEntity === null) throw new NotFoundException('subscription not found');

            await this.spaceUsecase.subscribedToPlan(subscription.metadata.space_id, subscriptionEntity, plan)

            eventBus.emit(SPACE_SUBSCRIBED_TO_PLAN, { plan, space: space })
        }
    }

    async createPaymentLink (priceId: string, spaceId: string) : Promise<string> {
        return this.paymentLinkService.generateLink(priceId, spaceId);
    }

    async createSubscriptionPlan (plan: SubscriptionPlan) : Promise<string> {
        return this.subscriptionPlanService.create(plan);
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