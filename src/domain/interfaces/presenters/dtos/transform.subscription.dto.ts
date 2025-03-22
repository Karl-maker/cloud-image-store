import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     TransformSubscriptionRequest:
 *       type: object
 *       properties:
 *         subscriptionId:
 *           type: string
 *           description: The ID of the subscription to be transformed.
 *         newPriceId:
 *           type: string
 *           description: The ID of the new subscription plan.
 *       required:
 *         - subscriptionId
 *         - newPriceId
 */

export const transformSubscriptionSchema = Joi.object({
    subscriptionId: Joi.string().required(),
    newPriceId: Joi.string().required(),
});

export type TransformSubscriptionDTO = {
    subscriptionId: string;
    newPriceId: string;
}