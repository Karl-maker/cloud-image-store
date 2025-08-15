import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../../../application/exceptions/unauthorized.exception";
import { TokenService } from "../../../application/services/token/interface.token.service";
import { SpaceRepository } from "../../../domain/repositories/space.repository";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { NotFoundException } from "../../../application/exceptions/not.found";
import { LimitReachedException } from "../../../application/exceptions/limit.reached.exception";
import { InsufficentStorageException } from "../../../application/exceptions/insufficent.storage.exception";
import { UploadContentDTO } from "../../../domain/interfaces/presenters/dtos/upload.content.dto";
import { ForbiddenException } from "../../../application/exceptions/forbidden.exception";
import { FindResponse } from "../../../domain/types/repository";
import { Space } from "../../../domain/entities/space";
import { User } from "../../../domain/entities/user";
import { mBToBytes } from "../../../utils/bytes.to.mb";


export const verifyUploadPermissions = async (req: Request, payload: any): Promise<boolean> => {
    const spaceId = (req.body as unknown as UploadContentDTO).spaceId;

    if(!payload.spaceId && payload.id) return true;

    if(payload.spaceId && (spaceId !== payload.spaceId)) return false
    
    const files = (req as any).files || [(req as any).file];

    let hasImage = false;
    let hasVideo = false;
  
    for (const file of files) {
      if (!file?.mimetype) continue;
  
      if (file.mimetype.startsWith('image/')) {
        hasImage = true;
      } else if (file.mimetype.startsWith('video/')) {
        hasVideo = true;
      }
    }

    if(!payload.allowPhotos && hasImage) return false;
    if(!payload.allowVideos && hasVideo) return false;

    return true;
}


const verifyUploadContent = (spaceRepository: SpaceRepository, userRepository: UserRepository) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user_id = (req as any).user?.id;
        let act_on_behalf: string | null = null;
        let user: User | null = null;
        let results: FindResponse<Space> = {
            data: [],
            pagination: {
                totalItems: 0,
                totalPages: 0,
                currentPage: 0,
                pageSize: 0
            }
        }

        if(user_id) {
            user = await userRepository.findById(user_id)
            if(!user) throw new NotFoundException('user not found');
        }

        if((req as any).user?.spaceId) {
            const space = await spaceRepository.findById((req as any).user?.spaceId);
            if(!space)throw new NotFoundException('space not found');

            user = await userRepository.findById(space.createdByUserId)
            if(!user) throw new NotFoundException('user not found');
        }

        if(req.body.spaceId) {
            const space = await spaceRepository.findById(req.body.spaceId);
            if(!space)throw new NotFoundException('space not found');

            act_on_behalf = space.createdByUserId
        }

        if(!user) throw new NotFoundException('user not found');

        results = await spaceRepository.findMany({
            filters: {
                createdByUserId: {
                    exact: act_on_behalf !== null ? act_on_behalf : user_id
                }
            },
        });

        let totalStorageUsed = 0;

        for (const item of results.data) {
            totalStorageUsed += item.usedMegabytes;
        }

        if(totalStorageUsed >= mBToBytes(user.maxStorage)) throw new InsufficentStorageException('no more storage available')

        next();
    } catch (error) {
        return next(error);
    }
};

export default verifyUploadContent;
