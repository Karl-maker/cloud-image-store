import { ContentFilterBy, ContentSortBy } from "../../../types/content";
import { FindManyDTO } from "./find.many.dto";
import Joi from "joi";

export type FindManyContentsDTO = ContentFilterBy & FindManyDTO<ContentSortBy>;

export const contentFilterBySchema = Joi.object({

    space_id: Joi.string().optional()
        .messages({
            "string.base": "space_id must be a string"
        }),
    
    mime_type: Joi.string().optional()
        .messages({
            "string.base": "mime_type must be a string"
        })
});
