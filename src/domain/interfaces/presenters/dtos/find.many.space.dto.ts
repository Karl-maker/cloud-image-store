import { SpaceFilterBy, SpaceSortBy } from "../../../types/space";
import { FindManyDTO } from "./find.many.dto";
import Joi from "joi";

export type FindManySpaceDTO = SpaceFilterBy & FindManyDTO<SpaceSortBy>;

export const spaceFilterBySchema = Joi.object({
    userIds: Joi.string().optional()
        .messages({
            "string.base": "first_name must be a string"
        }),

    createdByUserId: Joi.string().optional()
        .messages({
            "string.base": "createdByUserId must be a string"
        }),

    subscriptionPlanId: Joi.string().optional()
        .messages({
            "string.base": "subscriptionPlanId must be a string"
        })
});
