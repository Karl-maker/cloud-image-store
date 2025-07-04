"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeRoutes = void 0;
const express_1 = __importDefault(require("express"));
const stripe_controller_1 = require("../controllers/stripe.controller");
const api_routes_1 = require("../../../domain/constants/api.routes");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const create_payment_link_dto_1 = require("../../../domain/interfaces/presenters/dtos/create.payment.link.dto");
const jwt_token_service_1 = require("../../../application/services/token/jwt.token.service");
const configuration_1 = require("../../../application/configuration");
const authentication_middleware_1 = __importDefault(require("../middlewares/authentication.middleware"));
const transform_subscription_dto_1 = require("../../../domain/interfaces/presenters/dtos/transform.subscription.dto");
const cancel_subscription_dto_1 = require("../../../domain/interfaces/presenters/dtos/cancel.subscription.dto");
const create_subscription_plan_dto_1 = require("../../../domain/interfaces/presenters/dtos/create.subscription.plan.dto");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Stripe
 *     description: Endpoints related to stripe management and actions
 */
const StripeRoutes = (usecase) => {
    const controller = new stripe_controller_1.StripeController(usecase, usecase.stripe, configuration_1.STRIPE_WEBHOOK_SECRET);
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
    router.post(api_routes_1.STRIPE_PATH + api_routes_1.PAYMENT_LINK_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, validation_middleware_1.validateBodyDTO)(create_payment_link_dto_1.createPaymentLinkSchema), controller.getPaymentLink.bind(controller));
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
    router.post(api_routes_1.STRIPE_PATH + api_routes_1.BILLING_LINK_PATH + api_routes_1.CUSTOMER_PARAM_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), controller.getBillingPortalLink.bind(controller));
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
    router.get(api_routes_1.STRIPE_PATH + api_routes_1.SUBSCRIPTION_PLAN_PATH, controller.findSubscriptionPlans.bind(controller));
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
    router.post(api_routes_1.STRIPE_PATH + api_routes_1.SUBSCRIPTION_PLAN_PATH, (0, validation_middleware_1.validateBodyDTO)(create_subscription_plan_dto_1.subscriptionPlanSchema), controller.createSubscriptionPlan.bind(controller));
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
    router.post(api_routes_1.STRIPE_PATH + api_routes_1.UPGRADE_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, validation_middleware_1.validateBodyDTO)(transform_subscription_dto_1.transformSubscriptionSchema), controller.upgradeSubscription.bind(controller));
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
    router.post(api_routes_1.STRIPE_PATH + api_routes_1.CANCEL_RENEWAL_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, validation_middleware_1.validateBodyDTO)(cancel_subscription_dto_1.cancelSubscriptionSchema), controller.cancelRenewal.bind(controller));
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
    router.post(api_routes_1.STRIPE_PATH + api_routes_1.CANCEL_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, validation_middleware_1.validateBodyDTO)(cancel_subscription_dto_1.cancelSubscriptionSchema), controller.cancelImmediately.bind(controller));
    return router;
};
exports.StripeRoutes = StripeRoutes;
