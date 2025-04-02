import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../../../application/exceptions/unauthorized.exception";
import { TokenService } from "../../../application/services/token/interface.token.service";
import { SpaceRepository } from "../../../domain/repositories/space.repository";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { NotFoundException } from "../../../application/exceptions/not.found";
import { LimitReachedException } from "../../../application/exceptions/limit.reached.exception";
import { InsufficentStorageException } from "../../../application/exceptions/insufficent.storage.exception";

const verifyCreateAlbum = (spaceRepository: SpaceRepository, userRepository: UserRepository) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user_id = (req as any).user?.id;

        const results = await spaceRepository.findMany({
            filters: {
                createdByUserId: {
                    exact: user_id
                }
            }
        })

        const user = await userRepository.findById(user_id)
        if(!user) throw new NotFoundException('user not found');
        if(user.maxSpaces <= results.pagination.totalItems)  throw new InsufficentStorageException('limit reached');
        next();
    } catch (error) {
        return next(error);
    }
};

export default verifyCreateAlbum;
