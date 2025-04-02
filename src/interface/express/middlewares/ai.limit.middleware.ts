import { NextFunction, Request, Response } from "express";
import { ContentRepository } from "../../../domain/repositories/content.repository";
import { CONTENT_PARAM } from "../../../domain/constants/api.routes";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { LimitReachedException } from "../../../application/exceptions/limit.reached.exception";


export const limitAiEnhancementMiddleware = (userRepository: UserRepository, contentRepository: ContentRepository) => async (
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

    const user = await userRepository.findById(content.spaceId);
    if(!user) {
        next(new Error('no user found'));
        return
    }

    const amountAllowed = user.maxAiEnhancementsPerMonth ?? 0;
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

    if(result.pagination.totalItems >= amountAllowed) next(new LimitReachedException('cannot generate more ai images'))
    next();
};
