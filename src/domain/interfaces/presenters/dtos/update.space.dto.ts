import Joi from 'joi';
import { SpaceShareType } from '../../../types/space';

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
 *         shareType:
 *           type: string
 *           enum: [invite, public, private]
 *           description: share type for space.
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
    shareType: Joi.string().valid('invite', 'private', 'public').required(),
    userIds: Joi.array().items(Joi.string().uuid()).optional(),
});


export type UpdateSpaceDTO = {
    name: string;
    description: string;
    totalMegabytes: number;
    shareType: SpaceShareType;
    usedMegabytes: number;
    subscriptionPlanId: string;
    userIds: string[];
}