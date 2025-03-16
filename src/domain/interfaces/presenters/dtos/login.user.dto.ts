import Joi from "joi";

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginUserRequest:
 *       type: object
 *       properties:
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
 *         - email
 *         - password
 */

export const loginUserSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.base": "Email must be a string",
        "string.email": "Invalid email format",
        "string.empty": "Email is required",
        "any.required": "Email is required",
    }),
    password: Joi.string()
        .min(8)
        .max(32)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$"))
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


export type LoginUserDTO = {
    email: string;
    password: string;
}