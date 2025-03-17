import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     CancelSubscriptionRequest:
 *       type: object
 *       properties:
 *         subscriptionId:
 *           type: string
 *           description: The ID of the subscription to be canceled.
 *       required:
 *         - subscriptionId
 */

export const cancelSubscriptionSchema = Joi.object({
    subscriptionId: Joi.string().required(),
});

export type CancelSubscriptionDTO = {
    subscriptionId: string;
}