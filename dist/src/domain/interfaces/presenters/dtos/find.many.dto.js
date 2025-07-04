"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findManySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.findManySchema = joi_1.default.object({
    page_size: joi_1.default.number().integer().min(1).required()
        .messages({
        "number.base": "page_size must be a number",
        "number.integer": "page_size must be an integer",
        "number.min": "page_size must be at least 1",
        "any.required": "page_size is required"
    }),
    page_number: joi_1.default.number().integer().min(1).required()
        .messages({
        "number.base": "page_number must be a number",
        "number.integer": "page_number must be an integer",
        "number.min": "page_number must be at least 1",
        "any.required": "page_number is required"
    }),
    order: joi_1.default.string().valid("asc", "desc").required()
        .messages({
        "any.only": `order must be either "asc" or "desc"`,
        "any.required": "order is required"
    })
});
