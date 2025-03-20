import Joi from 'joi';
import { SubscriptionPlan } from '../../../entities/subscription.plan';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSubscriptionPlanRequest:
 *       type: object
 *       $ref: '#/components/schemas/SubscriptionPlanResponse'
 *       description: The request body for creating or updating a subscription plan.
 */

const priceSchema = Joi.object({
    period: Joi.string().valid('month', 'year').required(), 
    frequency: Joi.number().integer().positive().required(),
    amount: Joi.number().precision(2).positive().required(),
    currency: Joi.string().valid('usd', 'eur').required() 
});

const featureSchema = Joi.object({
    name: Joi.string().min(1).required(),
    included: Joi.boolean().required()
});

export const subscriptionPlanSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    megabytes: Joi.number().integer().positive().required(),
    users: Joi.number().integer().positive().required(),
    prices: Joi.array().items(priceSchema).min(1).required(),
    features: Joi.array().items(featureSchema).required(),
    highlighted: Joi.boolean().required(),
});

export type CreateSubscriptionPlanDTO = SubscriptionPlan