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
    period: Joi.string().valid('month', 'year', 'day', 'week').optional(), 
    frequency: Joi.number().integer().positive().optional(),
    amount: Joi.number().precision(2).positive().required(),
    currency: Joi.string().valid('usd', 'euro').required(),
    recurring: Joi.boolean().optional(),
}).custom((value, helpers) => {
    // If recurring is true, period and frequency are required
    if (value.recurring && (!value.period || !value.frequency)) {
        return helpers.error('any.invalid', { message: 'Period and frequency are required when recurring is true' });
    }
    return value;
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
    spaces: Joi.number().integer().positive().required(), // Added this field
});

export type CreateSubscriptionPlanDTO = SubscriptionPlan