import { UserFilterBy, UserSortBy } from "../../../types/user";
import { FindManyDTO } from "./find.many.dto";
import Joi from "joi";

export type FindManyUsersDTO = UserFilterBy & FindManyDTO<UserSortBy>;

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
