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
 *         newPlanId:
 *           type: string
 *           description: The ID of the new subscription plan.
 *       required:
 *         - subscriptionId
 *         - newPlanId
 */

export const transformSubscriptionSchema = Joi.object({
    subscriptionId: Joi.string().required(),
    newPlanId: Joi.string().required(),
});

export type TransformSubscriptionDTO = {
    subscriptionId: string;
    newPlanId: string;
}