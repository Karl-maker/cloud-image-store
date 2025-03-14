import Joi from 'joi';

export const createSpaceSchema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(1000).optional(),
    createdByUserId: Joi.string().uuid().required(),
    totalMegabytes: Joi.number().integer().positive().required(),
    subscriptionPlanId: Joi.string().uuid().required(),
});


export type CreateSpaceDTO = {
    name: string;
    description: string;
    createdByUserId: string;
    totalMegabytes: number;
    subscriptionPlanId: string;
}