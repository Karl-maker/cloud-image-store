import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../../../application/exceptions/unauthorized.exception";
import { TokenService } from "../../../application/services/token/interface.token.service";
import { SpaceRepository } from "../../../domain/repositories/space.repository";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { NotFoundException } from "../../../application/exceptions/not.found";
import { LimitReachedException } from "../../../application/exceptions/limit.reached.exception";
import { InsufficentStorageException } from "../../../application/exceptions/insufficent.storage.exception";

const verifyUploadContent = (spaceRepository: SpaceRepository, userRepository: UserRepository) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user_id = (req as any).user?.id;
        const user = await userRepository.findById(user_id)
        if(!user) throw new NotFoundException('user not found');

        const SPACES = user.maxSpaces;
        
        const results = await spaceRepository.findMany({
            filters: {
                createdByUserId: {
                    exact: user_id
                }
            },
            pageSize: SPACES
        });

        let totalStorageUsed = 0;

        for (const item of results.data) {
            totalStorageUsed += item.usedMegabytes;
        }

        if(totalStorageUsed >= user.maxStorage) throw new InsufficentStorageException('no more storage available')

        next();
    } catch (error) {
        return next(error);
    }
};

export default verifyUploadContent;
