import { UserFilterBy, UserSortBy } from "../../../types/user";
import { FindManyDTO } from "./find.many.dto";
import Joi from "joi";

export type FindManyUsersDTO = UserFilterBy & FindManyDTO<UserSortBy>;

export const userFilterBySchema = Joi.object({
    firstName: Joi.string().min(1).max(255).optional()
        .messages({
            "string.base": "firstName must be a string",
            "string.min": "firstName cannot be empty",
            "string.max": "firstName cannot exceed 255 characters"
        }),

    lastName: Joi.string().min(1).max(255).optional()
        .messages({
            "string.base": "lastName must be a string",
            "string.min": "lastName cannot be empty",
            "string.max": "lastName cannot exceed 255 characters"
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
