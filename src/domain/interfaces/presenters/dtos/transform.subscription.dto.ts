import Joi from 'joi';

export const transformSubscriptionSchema = Joi.object({
    subscriptionId: Joi.string().required(),
    newPlanId: Joi.string().required(),
});

export type TransformSubscriptionDTO = {
    subscriptionId: string;
    newPlanId: string;
}