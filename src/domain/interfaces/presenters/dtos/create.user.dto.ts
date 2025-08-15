import Joi from "joi";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: First name of the user
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Last name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 32
 *           description: >
 *             User password. Must be at least 8 characters long and contain:
 *             - One uppercase letter
 *             - One lowercase letter
 *             - One number
 *             - One special character
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 */

export const createUserSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
        "string.base": "First name must be a string",
        "string.empty": "First name is required",
        "string.min": "First name must be at least 2 characters",
        "any.required": "First name is required",
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
        "string.base": "Last name must be a string",
        "string.empty": "Last name is required",
        "string.min": "Last name must be at least 2 characters",
        "any.required": "Last name is required",
    }),
    email: Joi.string().email().required().messages({
        "string.base": "Email must be a string",
        "string.email": "Invalid email format",
        "string.empty": "Email is required",
        "any.required": "Email is required",
    }),
    password: Joi.string()
        .min(8)
        .max(32)
        .required()
        .messages({
            "string.base": "Password must be a string",
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters long",
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            "any.required": "Password is required",
        }),
});


export type CreateUserDTO = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}