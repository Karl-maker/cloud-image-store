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
        } else if(event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            
            // Check if this payment intent is NOT associated with a subscription
            if (!paymentIntent.invoice) {
                // This is a non-subscription charge - get product data
                let productId: string | undefined;
                let priceId: string | undefined;
                
                // Try to get product info from metadata first
                productId = paymentIntent.metadata?.product_id;
                priceId = paymentIntent.metadata?.price_id;
                
                // If not in metadata, try to get from the session
                if (!productId && paymentIntent.metadata?.session_id) {
                    try {
                        const session = await this.stripe.checkout.sessions.retrieve(
                            paymentIntent.metadata.session_id,
                            { expand: ['line_items.data.price.product'] }
                        );
                        
                        if (session.line_items?.data?.[0]?.price?.product) {
                            productId = (session.line_items.data[0].price.product as Stripe.Product).id;
                            priceId = session.line_items.data[0].price.id;
                        }
                    } catch (sessionError) {
                        console.log('Could not retrieve session for payment intent:', paymentIntent.id);
                    }
                }
                
                console.log('Non-subscription charge detected:', {
                    paymentIntentId: paymentIntent.id,
                    customerId: paymentIntent.customer,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    status: paymentIntent.status,
                    created: new Date(paymentIntent.created * 1000),
                    metadata: paymentIntent.metadata,
                    description: paymentIntent.description,
                    productId: productId,
                    priceId: priceId
                });

                const product = await this.subscriptionPlanService.findById(productId);

                if(!product)  throw new Error('no product found');

                const user = await this.userUsecase.findById(paymentIntent.customer as string);

                if(!user) throw new NotFoundException('no user found');
                if(user instanceof Error) throw user;

                const result = await this.userUsecase.receiveProduct(product, user);
                if(result instanceof Error) throw result;
            }
            // If paymentIntent.invoice exists, it's a subscription payment - we don't need to log it here
            // Subscription payments are handled by the subscription events
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
            const subscription = event.data.object as Stripe.Subscription;
            const previousAttributes = event.data.previous_attributes as any;
            
            // Check if subscription was set to cancel at period end
            if (previousAttributes?.cancel_at_period_end === false && subscription.cancel_at_period_end === true) {
                console.log('Subscription set to cancel at period end:', subscription.id);
                // Don't call subscriptionEnd yet - wait for the period to actually end
            }
            
            // Check if subscription naturally ended (current_period_end is in the past and status is not active)
            const now = Math.floor(Date.now() / 1000);
            if (subscription.current_period_end < now && subscription.status !== 'active') {
                console.log('Subscription naturally ended:', subscription.id);
                const result = await this.userUsecase.subscriptionEnd(subscription.customer as string);
                if(result instanceof Error || result instanceof NotFoundException) throw result;
                return; // Exit early since subscription ended
            }
            
            // Check for plan updates (existing logic)
            const updatedPlan = previousAttributes?.plan as undefined | {
                id: string
            };

            if(!updatedPlan) return; // plan didnt update
            if(!updatedPlan.id) return; // plan didnt update

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