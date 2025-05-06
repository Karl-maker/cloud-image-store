import express, { Request } from "express";
import { StripeUsecase } from "../../../domain/usecases/stripe.usecase";
import { StripeController } from "../controllers/stripe.controller";
import Stripe from "stripe";
import { BILLING_LINK_PATH, CANCEL_PATH, CANCEL_RENEWAL_PATH, CUSTOMER_PARAM, CUSTOMER_PARAM_PATH, PAYMENT_LINK_PATH, STRIPE_PATH, SUBSCRIPTION_PLAN_PATH, UPGRADE_PATH, WEBHOOK_PATH } from "../../../domain/constants/api.routes";
import { validateBodyDTO } from "../middlewares/validation.middleware";
import { createPaymentLinkSchema } from "../../../domain/interfaces/presenters/dtos/create.payment.link.dto";
import { JwtTokenService } from "../../../application/services/token/jwt.token.service";
import { STRIPE_WEBHOOK_SECRET, TOKEN_SECRET } from "../../../application/configuration";
import authentication from "../middlewares/authentication.middleware";
import { transformSubscriptionSchema } from "../../../domain/interfaces/presenters/dtos/transform.subscription.dto";
import { cancelSubscriptionSchema } from "../../../domain/interfaces/presenters/dtos/cancel.subscription.dto";
import { subscriptionPlanSchema } from "../../../domain/interfaces/presenters/dtos/create.subscription.plan.dto";

const router = express.Router();

    /**
     * @swagger
     * tags:
     *   - name: Stripe
     *     description: Endpoints related to stripe management and actions
     */

export const StripeRoutes = (
    usecase: StripeUsecase
) => {
    const controller = new StripeController(
        usecase,
        usecase.stripe,
        STRIPE_WEBHOOK_SECRET!
    );

    /**
     * @swagger
     * /stripe/payment-link:
     *   post:
     *     tags:
     *       - Stripe
     *     summary: Create a payment link
     *     description: Creates a payment link for a specified price and space.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreatePaymentLinkRequest'
     *     responses:
     *       200:
     *         description: Payment link successfully created.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 link:
     *                   type: string
     *                   description: The URL of the created payment link.
     *       400:
     *         description: Invalid input or missing parameters.
     *       500:
     *         description: Internal server error.
     */

    router.post(STRIPE_PATH + PAYMENT_LINK_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(createPaymentLinkSchema), controller.getPaymentLink.bind(controller))

    /**
     * @swagger
     * /stripe/billing-portal-link/{customer_id}:
     *   post:
     *     tags:
     *       - Stripe
     *     summary: Create billing portal link
     *     description: Creates a billing portal link for a specified customer.
     *     parameters:
     *       - in: path
     *         name: customer_id
     *         required: true
     *         schema:
     *           type: string
     *         description: The Stripe customer ID.
     *     responses:
     *       200:
     *         description: Billing portal successfully created.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 link:
     *                   type: string
     *                   description: The URL of the billing portal.
     *       400:
     *         description: Invalid input or missing parameters.
     *       500:
     *         description: Internal server error.
     */

    router.post(STRIPE_PATH + BILLING_LINK_PATH + CUSTOMER_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.getBillingPortalLink.bind(controller))

    /**
     * @swagger
     * /stripe/subscription-plan:
     *   get:
     *     tags:
     *       - Stripe
     *     summary: Get all subscription plans
     *     description: Retrieves all available subscription plans.
     *     responses:
     *       200:
     *         description: Successfully retrieved all subscription plans.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/SubscriptionPlanResponse'
     *       500:
     *         description: Internal server error.
     */

    router.get(STRIPE_PATH + SUBSCRIPTION_PLAN_PATH, controller.findSubscriptionPlans.bind(controller))

    /**
     * @swagger
     * /stripe/subscription-plan:
     *   post:
     *     tags:
     *       - Stripe
     *     summary: Create a payment link
     *     description: Creates a payment link for a specified price and space.
     *     security:
     *       - ApiKeyAuth: [] 
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateSubscriptionPlanRequest'
     *     responses:
     *       200:
     *         description: Subscription plan successfully created.
     *       400:
     *         description: Invalid input or missing parameters.
     *       500:
     *         description: Internal server error.
     */

    router.post(STRIPE_PATH + SUBSCRIPTION_PLAN_PATH, validateBodyDTO(subscriptionPlanSchema), controller.createSubscriptionPlan.bind(controller))

    /**
     * @swagger
     * /stripe/upgrade:
     *   post:
     *     tags:
     *       - Stripe
     *     summary: Upgrade or downgrade a subscription
     *     description: Allows a user to upgrade or downgrade their subscription plan.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/TransformSubscriptionRequest'
     *     responses:
     *       200:
     *         description: Successfully updated the subscription.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SubscriptionResponse'
     *       400:
     *         description: Invalid request data.
     *       401:
     *         description: Unauthorized request.
     *       404:
     *         description: Subscription not found.
     *       500:
     *         description: Internal server error.
     */

    router.post(STRIPE_PATH + UPGRADE_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(transformSubscriptionSchema), controller.upgradeSubscription.bind(controller))

    /**
     * @swagger
     * /stripe/cancel-renewal:
     *   post:
     *     tags:
     *       - Stripe
     *     summary: Cancel subscription renewal
     *     description: Cancels the auto-renewal of an active subscription.
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CancelSubscriptionRequest'
     *     responses:
     *       200:
     *         description: Subscription renewal successfully canceled. No content returned.
     *       400:
     *         description: Invalid request data.
     *       401:
     *         description: Unauthorized request.
     *       404:
     *         description: Subscription not found.
     *       500:
     *         description: Internal server error.
     */
        
    router.post(STRIPE_PATH + CANCEL_RENEWAL_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(cancelSubscriptionSchema), controller.cancelRenewal.bind(controller))

    /**
     * @swagger
     * /stripe/cancel:
     *   post:
     *     tags:
     *       - Stripe
     *     summary: Cancel subscription immediately
     *     description: Cancels an active subscription immediately.
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CancelSubscriptionRequest'
     *     responses:
     *       200:
     *         description: Subscription successfully canceled. No content returned.
     *       400:
     *         description: Invalid request data.
     *       401:
     *         description: Unauthorized request.
     *       404:
     *         description: Subscription not found.
     *       500:
     *         description: Internal server error.
     */

    router.post(STRIPE_PATH + CANCEL_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(cancelSubscriptionSchema), controller.cancelImmediately.bind(controller))

    return router;
}