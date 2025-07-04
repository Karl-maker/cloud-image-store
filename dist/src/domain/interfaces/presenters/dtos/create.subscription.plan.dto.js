"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionPlanSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSubscriptionPlanRequest:
 *       type: object
 *       $ref: '#/components/schemas/SubscriptionPlanResponse'
 *       description: The request body for creating or updating a subscription plan.
 */
const priceSchema = joi_1.default.object({
    period: joi_1.default.string().valid('month', 'year', 'day', 'week').optional(),
    frequency: joi_1.default.number().integer().positive().optional(),
    amount: joi_1.default.number().precision(2).positive().required(),
    currency: joi_1.default.string().valid('usd', 'euro').required(),
    recurring: joi_1.default.boolean().optional(),
}).custom((value, helpers) => {
    // If recurring is true, period and frequency are required
    if (value.recurring && (!value.period || !value.frequency)) {
        return helpers.error('any.invalid', { message: 'Period and frequency are required when recurring is true' });
    }
    return value;
});
const featureSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).required(),
    included: joi_1.default.boolean().required()
});
exports.subscriptionPlanSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(100).required(),
    description: joi_1.default.string().max(500).optional(),
    megabytes: joi_1.default.number().integer().positive().required(),
    users: joi_1.default.number().integer().positive().required(),
    prices: joi_1.default.array().items(priceSchema).min(1).required(),
    features: joi_1.default.array().items(featureSchema).required(),
    highlighted: joi_1.default.boolean().required(),
    spaces: joi_1.default.number().integer().positive().required(), // Added this field
});
