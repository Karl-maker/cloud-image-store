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


export const verifyUploadPermissions = async (req: Request, payload: any): Promise<boolean> => {
    const spaceId = (req.body as unknown as UploadContentDTO).spaceId;

    if(!payload.spaceId) return true;

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
