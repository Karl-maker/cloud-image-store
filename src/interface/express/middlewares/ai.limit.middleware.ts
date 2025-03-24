import { NextFunction, Request, Response } from "express";
import { ContentRepository } from "../../../domain/repositories/content.repository";
import { SpaceRepository } from "../../../domain/repositories/space.repository";
import { CreateContentVariantDTO } from "../../../domain/interfaces/presenters/dtos/create.content.variant.dto";
import { LimitReacgedException } from "../../../application/exceptions/limit.reached.exception";
import { CONTENT_PARAM } from "../../../domain/constants/api.routes";


export const limitAiEnhancementMiddleware = (spaceRepository: SpaceRepository, contentRepository: ContentRepository) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const contentId = req.params[CONTENT_PARAM]
    const content = await contentRepository.findById(contentId);
    if(!content){
        next(new Error('no content found'));
        return;
    } 

    const space = await spaceRepository.findById(content.spaceId);
    if(!space) {
        next(new Error('no space found'));
        return
    }

    const amountAllowed = space.aiGenerationsPerMonth ?? 0;
    const result = await contentRepository.findMany({
        pageSize: 1,
        pageNumber: 1,
        filters: {
            ai: {
                exact: true
            },
            createdAt: {
                less: new Date(),
                greater: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
        }
    })

    if(result.pagination.totalItems >= amountAllowed) next(new LimitReacgedException('cannot generate more ai images'))
    next();
};
