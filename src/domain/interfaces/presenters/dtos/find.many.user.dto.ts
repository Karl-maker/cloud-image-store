import { UserFilterBy, UserSortBy } from "../../../../domain/types/user";
import { FindManyDTO } from "./find.many.dto";
import Joi from "joi";

export type FindManyUsersDTO = UserFilterBy & FindManyDTO<UserSortBy>;

/**
 * @swagger
 * components:
 *   schemas:
 *     UserFilterRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: Optional first name to filter users
 *         lastName:
 *           type: string
 *           description: Optional last name to filter users
 *         email:
 *           type: string
 *           format: email
 *           description: Optional email to filter users
 *         confirmed:
 *           type: boolean
 *           description: Optional flag to filter users based on confirmation status
 */

export const userFilterBySchema = Joi.object({
    firstName: Joi.string().min(1).max(255).optional()
        .messages({
            "string.base": "first_name must be a string",
            "string.min": "first_name cannot be empty",
            "string.max": "first_name cannot exceed 255 characters"
        }),

    lastName: Joi.string().min(1).max(255).optional()
        .messages({
            "string.base": "last_name must be a string",
            "string.min": "last_name cannot be empty",
            "string.max": "last_name cannot exceed 255 characters"
        }),

    email: Joi.string().email().optional()
        .messages({
            "string.email": "email must be a valid email address"
        }),

    confirmed: Joi.boolean().optional()
        .messages({
            "boolean.base": "confirmed must be a boolean"
        })
});
