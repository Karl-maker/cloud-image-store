import express from "express";
import { StripeUsecase } from "../../../domain/usecases/stripe.usecase";
import { StripeController } from "../controllers/stripe.controller";
import Stripe from "stripe";
import { CANCEL_PATH, PAYMENT_LINK_PATH, STRIPE_PATH, SUBSCRIPTION_PLAN_PATH, UPGRADE_PATH, WEBHOOK_PATH } from "../../../domain/constants/api.routes";
import { validateBodyDTO } from "../middlewares/validation.middleware";
import { createPaymentLinkSchema } from "../../../domain/interfaces/presenters/dtos/create.payment.link.dto";
import { JwtTokenService } from "../../../application/services/token/jwt.token.service";
import { TOKEN_SECRET } from "../../../application/configuration";
import authentication from "../middlewares/authentication.middleware";
import { transformSubscriptionSchema } from "../../../domain/interfaces/presenters/dtos/transform.subscription.dto";
import { cancelSubscriptionSchema } from "../../../domain/interfaces/presenters/dtos/cancel.subscription.dto";

const router = express.Router();

    /**
     * @swagger
     * tags:
     *   - name: Stripe
     *     description: Endpoints related to stripe management and actions
     */

export const StripeRoutes = (
    usecase: StripeUsecase,
    stripe: Stripe,
    endpointSecret: string
) => {
    const controller = new StripeController(
        usecase,
        stripe,
        endpointSecret
    );

    router.post(STRIPE_PATH + WEBHOOK_PATH, express.raw({ type: 'application/json' }), controller.webhook.bind(controller)); 

    router.post(STRIPE_PATH + PAYMENT_LINK_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(createPaymentLinkSchema), controller.getPaymentLink.bind(controller))

    router.get(STRIPE_PATH + SUBSCRIPTION_PLAN_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.findSubscriptionPlans.bind(controller))

    router.post(STRIPE_PATH + UPGRADE_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(transformSubscriptionSchema), controller.upgradeSubscription.bind(controller))

    router.post(STRIPE_PATH + CANCEL_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(cancelSubscriptionSchema), controller.cancelRenewal.bind(controller))


}