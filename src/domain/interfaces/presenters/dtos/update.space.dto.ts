import Joi from 'joi';

export const updateSpaceSchema = Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    totalMegabytes: Joi.number().integer().positive().optional(),
    usedMegabytes: Joi.number().integer().min(0).optional(),
    subscriptionPlanId: Joi.string().uuid().optional(),
    userIds: Joi.array().items(Joi.string().uuid()).optional(),
});


export type UpdateSpaceDTO = {
    name: string;
    description: string;
    totalMegabytes: number;
    usedMegabytes: number;
    subscriptionPlanId: string;
    userIds: string[];
}