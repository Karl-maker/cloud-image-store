"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFilterBySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.userFilterBySchema = joi_1.default.object({
    firstName: joi_1.default.string().min(1).max(255).optional()
        .messages({
        "string.base": "firstName must be a string",
        "string.min": "firstName cannot be empty",
        "string.max": "firstName cannot exceed 255 characters"
    }),
    lastName: joi_1.default.string().min(1).max(255).optional()
        .messages({
        "string.base": "lastName must be a string",
        "string.min": "lastName cannot be empty",
        "string.max": "lastName cannot exceed 255 characters"
    }),
    email: joi_1.default.string().email().optional()
        .messages({
        "string.email": "email must be a valid email address"
    }),
    confirmed: joi_1.default.boolean().optional()
        .messages({
        "boolean.base": "confirmed must be a boolean"
    })
});
