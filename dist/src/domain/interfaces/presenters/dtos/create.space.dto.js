"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpaceSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSpaceRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           description: Name of the space
 *         shareType:
 *           type: string
 *           enum: [invite, public, private]
 *           description: share type for space.
 *         description:
 *           type: string
 *           maxLength: 1000
 *           nullable: true
 *           description: Optional description of the space
 *       required:
 *         - name
 *         - createdByUserId
 *         - shareType
 */
exports.createSpaceSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(255).required(),
    description: joi_1.default.string().max(1000).optional(),
    shareType: joi_1.default.string().valid('invite', 'private', 'public').required()
});
