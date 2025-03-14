import Joi from "joi";
import { SortOrder } from "../../../../domain/types/repository";

export type FindManyDTO<SortByKeys> = {
    page_size: number;
    page_number: number;
    order: SortOrder;
    by: keyof SortByKeys;
}

export const findManySchema = Joi.object({
    page_size: Joi.number().integer().min(1).required()
        .messages({
            "number.base": "page_size must be a number",
            "number.integer": "page_size must be an integer",
            "number.min": "page_size must be at least 1",
            "any.required": "page_size is required"
        }),
        
    page_number: Joi.number().integer().min(1).required()
        .messages({
            "number.base": "page_number must be a number",
            "number.integer": "page_number must be an integer",
            "number.min": "page_number must be at least 1",
            "any.required": "page_number is required"
        }),

    order: Joi.string().valid("asc", "desc").required()
        .messages({
            "any.only": `order must be either "asc" or "desc"`,
            "any.required": "order is required"
        })
});
