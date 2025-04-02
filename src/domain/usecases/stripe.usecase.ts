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
import { USER_SUBSCRIBED_TO_PLAN } from "../constants/event.names";
import { EventBus } from "../../infrastructure/event/event.bus";
import { SpaceUsecase } from "./space.usecase";
import { NotFoundException } from "../../application/exceptions/not.found";
import { UserUsecase } from "./user.usecase";
import { StripeBillingPortalService } from "../../application/services/payment/stripe.billing.portal.service";
import { BillingPortalService } from "../../application/services/payment/interface.billing.portal.service";
import { ForbiddenException } from "../../application/exceptions/forbidden.exception";


export class StripeUsecase {
    private paymentLinkService: PaymentLinkService;
    private subscriptionService: SubscriptionService;
    private subscriptionPlanService: SubscriptionPlanService;
    private paymentCustomerService: PaymentCustomerService;
    private billingPortalService: BillingPortalService;

    constructor(
        public stripe: Stripe,
        private spaceUsecase: SpaceUsecase,
        private userUsecase: UserUsecase
    ) {
        this.subscriptionService = new StripeSubscriptionService(stripe);
        this.paymentLinkService = new StripePaymentLinkService(stripe);
        this.subscriptionPlanService = new StripeSubscriptionPlanService(stripe);
        this.paymentCustomerService = new StripePaymentCustomer(stripe);
        this.billingPortalService = new StripeBillingPortalService(stripe)
    }

    async webhook (event: Stripe.Event, eventBus: EventBus) : Promise<void>{
        if(event.type === 'customer.subscription.created') {
            const customerSubscription = event.data.object as Stripe.Subscription;

            const subscription = await this.subscriptionService.findById(customerSubscription.id as string);
            
            if(!subscription) throw new Error('no subscription found');
            
            const plan = await this.subscriptionPlanService.findById(subscription.planId);

            if(!plan)  throw new Error('no plan found');

            const result = await this.userUsecase.subscribedToPlan(customerSubscription.customer as string, subscription, plan);

            if(result instanceof Error || result instanceof NotFoundException) throw result;

            eventBus.emit(USER_SUBSCRIBED_TO_PLAN, { plan, user: result })
        } else if(event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            const result = await this.userUsecase.subscriptionEnd(subscription.customer as string);
            if(result instanceof Error || result instanceof NotFoundException) throw result;
        } else if(event.type === 'customer.subscription.paused') {
            const subscription = event.data.object as Stripe.Subscription;
            const result = await this.userUsecase.subscriptionPaused(subscription.customer as string);
            if(result instanceof Error || result instanceof NotFoundException) throw result;
        } else if(event.type === 'customer.subscription.resumed') {
            const subscription = event.data.object as Stripe.Subscription;
            const result = await this.userUsecase.subscriptionResumed(subscription.customer as string);
            if(result instanceof Error || result instanceof NotFoundException) throw result;
        } else if(event.type === 'customer.subscription.updated') {
            const subscription = event.data.object;
            const updatedPlan = (event.data.previous_attributes as any).plan as undefined | {
                id: string
            };

            if(!updatedPlan) return; // plan didnt update

            const planId = subscription.items.data[0].plan.product as string;
            const plan = await this.subscriptionPlanService.findById(planId);

            if(!plan) throw new Error('no plan found');

            const subscriptionEntity = await this.subscriptionService.findById(subscription.id as string);

            if(subscriptionEntity === null) throw new NotFoundException('subscription not found');

            const newUser = await this.userUsecase.subscribedToPlan(subscription.customer as string, subscriptionEntity, plan)
            if(newUser instanceof Error || newUser instanceof NotFoundException) throw newUser;

            eventBus.emit(USER_SUBSCRIBED_TO_PLAN, { plan, user: newUser })
        }
    }

    async createPaymentLink (priceId: string, userId: string, spaceId?: string) : Promise<string> {

        const user = await this.userUsecase.findById(userId);
        
        if(!user || user instanceof Error) throw new NotFoundException('no user found');
        if(user.subscriptionStripeId) throw new ForbiddenException('already has subscription');

        const customerId = user.stripeId;

        if(!customerId) throw new NotFoundException('no customer stripe id found');
        
        return this.paymentLinkService.generateLink(priceId, customerId, spaceId);
        
        
    }

    async billingPortalLink (customerId: string) : Promise<string> {
        return await this.billingPortalService.generateLink(customerId);
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