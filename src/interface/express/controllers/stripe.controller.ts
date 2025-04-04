import { NextFunction, Request, Response } from "express";
import { StripeUsecase } from "../../../domain/usecases/stripe.usecase";
import { CreatePaymentLinkDTO } from "../../../domain/interfaces/presenters/dtos/create.payment.link.dto";
import { CancelSubscriptionDTO } from "../../../domain/interfaces/presenters/dtos/cancel.subscription.dto";
import { TransformSubscriptionDTO } from "../../../domain/interfaces/presenters/dtos/transform.subscription.dto";
import Stripe from "stripe";
import { eventBus } from "../../../infrastructure/event/event.bus";
import { CreateSubscriptionPlanDTO } from "../../../domain/interfaces/presenters/dtos/create.subscription.plan.dto";
import { CUSTOMER_PARAM } from "../../../domain/constants/api.routes";

export class StripeController {
    constructor(
        private readonly usecase: StripeUsecase,
        private readonly stripe: Stripe,
        private readonly endpointSecret: string,
    ) {}

    async getPaymentLink(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {   
            const userId = (req as any).user?.id
            const {
                priceId, spaceId
            } = req.body as CreatePaymentLinkDTO;
            
            const link = await this.usecase.createPaymentLink(priceId, userId, spaceId)

            res.status(201).json({ link });
        } catch (error) {
            next(error)
        }
    }

    async getBillingPortalLink(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {   
            const customer_id = req.params[CUSTOMER_PARAM];
            const link = await this.usecase.billingPortalLink(customer_id)

            res.status(201).json({ link });
        } catch (error) {
            next(error)
        }
    }

    async createSubscriptionPlan(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {   
            const params = req.body as CreateSubscriptionPlanDTO;
            const response = await this.usecase.createSubscriptionPlan(params)
            console.log(response)
            res.status(201).end();
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    async cancelRenewal(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {   
            const {
                subscriptionId
            } = req.body as CancelSubscriptionDTO;
            await this.usecase.cancelSubscriptionRenewal(subscriptionId)

            res.status(200).end();
        } catch (error) {
            next(error)
        }
    }

    async cancelImmediately(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {   
            const {
                subscriptionId
            } = req.body as CancelSubscriptionDTO;
            await this.usecase.cancelSubscriptionImmediately(subscriptionId)

            res.status(200).end();
        } catch (error) {
            next(error)
        }
    }

    async findSubscriptionPlans(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {   
            const plans = await this.usecase.findAllSubscriptionPlans()

            res.status(200).json({
                data: plans
            });
        } catch (error) {
            next(error)
        }
    }

    async upgradeSubscription(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {   
            const {
                subscriptionId,
                newPriceId
            } = req.body as TransformSubscriptionDTO;

            const subscription = await this.usecase.upgradeSubscription(subscriptionId, newPriceId)

            res.status(200).json(subscription);
        } catch (error) {
            next(error)
        }
    }

    async downgradeSubscription(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {   
            const {
                subscriptionId,
                newPriceId
            } = req.body as TransformSubscriptionDTO;

            const subscription = await this.usecase.downgradeSubscription(subscriptionId, newPriceId)

            res.status(200).json(subscription);
        } catch (error) {
            next(error)
        }
    }

    async webhook(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {   

            const sig = req.headers['stripe-signature'] as string; 
            const payload = req.body; 
            const event = this.stripe.webhooks.constructEvent(payload, sig, this.endpointSecret);

            await this.usecase.webhook(event, eventBus)

            res.status(200).send('Event received');
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
    
}