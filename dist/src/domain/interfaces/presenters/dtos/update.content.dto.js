"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateContentRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the content. Maximum length of 255 characters.
 *         description:
 *           type: string
 *           description: A description of the content. Maximum length of 1000 characters.
 *         spaceId:
 *           type: integer
 *           description: The ID of the space associated with the content.
 *         favorite:
 *           type: boolean
 *           description: media that is favourited.
 *       required: []
 */
exports.updateContentSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(255).optional(),
    description: joi_1.default.string().max(1000).optional(),
    spaceId: joi_1.default.number().optional(),
    favorite: joi_1.default.boolean().optional()
});
