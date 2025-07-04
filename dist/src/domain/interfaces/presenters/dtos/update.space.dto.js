"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSpaceSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateSpaceRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the space. Maximum length of 255 characters.
 *         description:
 *           type: string
 *           description: A description of the space. Maximum length of 1000 characters.
 *         shareType:
 *           type: string
 *           enum: [invite, public, private]
 *           description: share type for space.
 *         userIds:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs associated with the space.
 *       required: []
 */
exports.updateSpaceSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(255).optional(),
    description: joi_1.default.string().max(1000).optional(),
    shareType: joi_1.default.string().valid('invite', 'private', 'public').required(),
    userIds: joi_1.default.array().items(joi_1.default.string()).optional(),
});
