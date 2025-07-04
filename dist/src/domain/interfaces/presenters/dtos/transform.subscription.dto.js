"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformSubscriptionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * @swagger
 * components:
 *   schemas:
 *     TransformSubscriptionRequest:
 *       type: object
 *       properties:
 *         subscriptionId:
 *           type: string
 *           description: The ID of the subscription to be transformed.
 *         newPriceId:
 *           type: string
 *           description: The ID of the new subscription plan.
 *       required:
 *         - subscriptionId
 *         - newPriceId
 */
exports.transformSubscriptionSchema = joi_1.default.object({
    subscriptionId: joi_1.default.string().required(),
    newPriceId: joi_1.default.string().required(),
});
