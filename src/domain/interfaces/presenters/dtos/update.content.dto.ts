import Joi from 'joi';

export const updateContentSchema = Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    spaceId: Joi.number().optional(),
});

export type UpdateContentDTO = {
    name: string;
    description: string | null;
    key: string;
    mimeType: string;
    location: string;
    spaceId: string;
    uploadCompletion: number;
}