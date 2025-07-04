"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spaceFilterBySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.spaceFilterBySchema = joi_1.default.object({
    userIds: joi_1.default.string().optional()
        .messages({
        "string.base": "firstName must be a string"
    }),
    createdByUserId: joi_1.default.string().optional()
        .messages({
        "string.base": "createdByUserId must be a string"
    }),
    subscriptionPlanId: joi_1.default.string().optional()
        .messages({
        "string.base": "subscriptionPlanId must be a string"
    })
});
