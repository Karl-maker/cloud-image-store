import Joi from 'joi';

export const cancelSubscriptionSchema = Joi.object({
    subscriptionId: Joi.string().required(),
});

export type CancelSubscriptionDTO = {
    subscriptionId: string;
}