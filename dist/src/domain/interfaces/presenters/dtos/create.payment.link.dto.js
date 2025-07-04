"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentLinkSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePaymentLinkRequest:
 *       type: object
 *       properties:
 *         priceId:
 *           type: string
 *           description: The ID of the price for the payment link.
 *         spaceId:
 *           type: string
 *           description: The ID of the space associated with the payment link.
 *       required:
 *         - priceId
 */
exports.createPaymentLinkSchema = joi_1.default.object({
    priceId: joi_1.default.string().required(),
    spaceId: joi_1.default.string().optional(),
});
