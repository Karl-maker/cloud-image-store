"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscriptionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * @swagger
 * components:
 *   schemas:
 *     CancelSubscriptionRequest:
 *       type: object
 *       properties:
 *         subscriptionId:
 *           type: string
 *           description: The ID of the subscription to be canceled.
 *       required:
 *         - subscriptionId
 */
exports.cancelSubscriptionSchema = joi_1.default.object({
    subscriptionId: joi_1.default.string().required(),
});
