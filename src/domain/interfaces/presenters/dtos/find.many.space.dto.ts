import { SpaceFilterBy, SpaceSortBy } from "../../../../domain/types/space";
import { FindManyDTO } from "./find.many.dto";
import Joi from "joi";

export type FindManySpaceDTO = SpaceFilterBy & FindManyDTO<SpaceSortBy>;

/**
 * @swagger
 * components:
 *   schemas:
 *     SpaceFilterRequest:
 *       type: object
 *       properties:
 *         userIds:
 *           type: string
 *           description: Optional user ID(s) to filter spaces
 *         createdByUserId:
 *           type: string
 *           description: Optional creator user ID to filter spaces
 *         subscriptionPlanId:
 *           type: string
 *           description: Optional subscription plan ID to filter spaces
 */

export const spaceFilterBySchema = Joi.object({
    userIds: Joi.string().min(1).max(255).optional()
        .messages({
            "string.base": "first_name must be a string",
            "string.min": "first_name cannot be empty",
            "string.max": "first_name cannot exceed 255 characters"
        }),

    createdByUserId: Joi.string().min(1).max(255).optional()
        .messages({
            "string.base": "createdByUserId must be a string",
            "string.min": "createdByUserId cannot be empty",
            "string.max": "createdByUserId cannot exceed 255 characters"
        }),

    subscriptionPlanId: Joi.string().min(1).max(255).optional()
        .messages({
            "string.base": "subscriptionPlanId must be a string",
            "string.min": "subscriptionPlanId cannot be empty",
            "string.max": "subscriptionPlanId cannot exceed 255 characters"
        })
});
