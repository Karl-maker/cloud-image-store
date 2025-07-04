"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContentVariantSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateContentVariantRequest:
 *       type: object
 *       properties:
 *         prompt:
 *           type: string
 *           description: The prompt of what you'd want to generate.
 *       required: []
 */
exports.createContentVariantSchema = joi_1.default.object({
    prompt: joi_1.default.string().required(),
});
