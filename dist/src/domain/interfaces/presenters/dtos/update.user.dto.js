"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
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
 *         password:
 *           type: string
 *           description: The user's password. Minimum length 8, maximum 32 characters, must include at least one uppercase letter, one lowercase letter, one number, and one special character.
 *       required: []
 */
exports.updateUserSchema = joi_1.default.object({
    firstName: joi_1.default.string().min(2).max(50).optional().messages({
        "string.base": "First name must be a string",
        "string.empty": "First name is required",
        "string.min": "First name must be at least 2 characters",
        "any.required": "First name is required",
    }),
    lastName: joi_1.default.string().min(2).max(50).optional().messages({
        "string.base": "Last name must be a string",
        "string.empty": "Last name is required",
        "string.min": "Last name must be at least 2 characters",
        "any.required": "Last name is required",
    }),
    password: joi_1.default.string()
        .min(8)
        .max(32)
        .optional()
        .messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "Password is required",
    }),
});
