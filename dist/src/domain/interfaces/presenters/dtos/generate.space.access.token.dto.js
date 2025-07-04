"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpaceTokenRequestSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createSpaceTokenRequestSchema = joi_1.default.object({
    timezone: joi_1.default.string().required(),
    instructions: joi_1.default.string().optional(),
    allowPhotos: joi_1.default.boolean().required(),
    allowVideos: joi_1.default.boolean().required(),
    start: joi_1.default.string()
        .pattern(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/)
        .required()
        .messages({
        'string.pattern.base': 'Start must be in YYYY-MM-DD format',
    }),
    end: joi_1.default.string()
        .pattern(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/)
        .required()
        .messages({
        'string.pattern.base': 'End must be in YYYY-MM-DD format',
    }),
    spaceId: joi_1.default.string().required()
});
/**
 * @swagger
 * components:
 *   schemas:
 *     GenerateSpaceTokenResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Token for accessing space
 *       required:
 *         - accessToken
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     GenerateSpaceTokenRequest:
 *       type: object
 *       properties:
 *         timezone:
 *           type: string
 *           description: Timezone of datetimes (e.g., "America/New_York")
 *         instructions:
 *           type: string
 *           description: Special instructions or notes
 *         allowPhotos:
 *           type: boolean
 *           description: Whether taking photos is allowed
 *         allowVideos:
 *           type: boolean
 *           description: Whether taking videos is allowed
 *         start:
 *           type: string
 *           description: Start date in format YYYY-MM-DD
 *         end:
 *           type: string
 *           description: End date in format YYYY-MM-DD
 *         spaceId:
 *           type: string
 *           description: ID of the space
 *       required:
 *         - timezone
 *         - allowPhotos
 *         - allowVideos
 *         - start
 *         - end
 *         - spaceId
 */
