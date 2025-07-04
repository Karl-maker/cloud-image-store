"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentFilterBySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.contentFilterBySchema = joi_1.default.object({
    name: joi_1.default.string().optional()
        .messages({
        "string.base": " name must be a string"
    }),
    spaceId: joi_1.default.string().optional()
        .messages({
        "string.base": "space_id must be a string"
    }),
    mimeType: joi_1.default.string().optional()
        .messages({
        "string.base": "mime_type must be a string"
    })
});
