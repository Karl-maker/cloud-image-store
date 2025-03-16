import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateSpaceRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the space. Maximum length of 255 characters.
 *         description:
 *           type: string
 *           description: A description of the space. Maximum length of 1000 characters.
 *         totalMegabytes:
 *           type: integer
 *           description: The total allocated megabytes for the space. Positive integer.
 *         usedMegabytes:
 *           type: integer
 *           description: The used megabytes in the space. Must be a non-negative integer.
 *         subscriptionPlanId:
 *           type: string
 *           format: uuid
 *           description: The UUID of the subscription plan associated with the space.
 *         userIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: List of user IDs associated with the space.
 *       required: []
 */

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