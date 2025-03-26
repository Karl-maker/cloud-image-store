import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateContentRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the content. Maximum length of 255 characters.
 *         description:
 *           type: string
 *           description: A description of the content. Maximum length of 1000 characters.
 *         spaceId:
 *           type: integer
 *           description: The ID of the space associated with the content.
 *         favorite:
 *           type: boolean
 *           description: media that is favourited.
 *       required: []
 */

export const updateContentSchema = Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    spaceId: Joi.number().optional(),
    favorite: Joi.boolean().optional()
});

export type UpdateContentDTO = {
    name: string;
    description: string | null;
    key: string;
    mimeType: string;
    location: string;
    spaceId: string;
    uploadCompletion: number;
    favorite: boolean;
}