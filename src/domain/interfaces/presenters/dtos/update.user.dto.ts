import Joi from "joi";

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: The user's first name. Minimum length 2, maximum 50 characters.
 *         lastName:
 *           type: string
 *           description: The user's last name. Minimum length 2, maximum 50 characters.
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address. Must be a valid email format.
 *         password:
 *           type: string
 *           description: The user's password. Minimum length 8, maximum 32 characters, must include at least one uppercase letter, one lowercase letter, one number, and one special character.
 *       required: []
 */

export const updateUserSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).optional().messages({
        "string.base": "First name must be a string",
        "string.empty": "First name is required",
        "string.min": "First name must be at least 2 characters",
        "any.required": "First name is required",
    }),
    lastName: Joi.string().min(2).max(50).optional().messages({
        "string.base": "Last name must be a string",
        "string.empty": "Last name is required",
        "string.min": "Last name must be at least 2 characters",
        "any.required": "Last name is required",
    }),
    email: Joi.string().email().optional().messages({
        "string.base": "Email must be a string",
        "string.email": "Invalid email format",
        "string.empty": "Email is required",
        "any.required": "Email is required",
    }),
    password: Joi.string()
        .min(8)
        .max(32)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$"))
        .optional()
        .messages({
            "string.base": "Password must be a string",
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters long",
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            "any.required": "Password is required",
        }),
});


export type UpdateUserDTO = {
    firstName?: string;
    lastName?: string;
    password?: string;
}