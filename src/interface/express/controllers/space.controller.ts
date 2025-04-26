import { Response, Request, NextFunction } from 'express';
import { eventBus } from '../../../infrastructure/event/event.bus';
import { SPACE_CREATED, SPACE_DELETED, USER_CREATED, USER_DELETED } from '../../../domain/constants/event.names';
import { SPACE_PARAM } from '../../../domain/constants/api.routes';
import { SpaceUsecase } from '../../../domain/usecases/space.usecase';
import { CreateSpaceDTO } from '../../../domain/interfaces/presenters/dtos/create.space.dto';
import { UpdateSpaceDTO } from '../../../domain/interfaces/presenters/dtos/update.space.dto';
import { FindManySpaceDTO } from '../../../domain/interfaces/presenters/dtos/find.many.space.dto';
import { GenerateAccessTokenDTO } from '../../../domain/interfaces/presenters/dtos/generate.space.access.token.dto';
import { VerifyAccessTokenDTO } from '../../../domain/interfaces/presenters/dtos/verify.space.access.token.dto';
import { ForbiddenException } from '../../../application/exceptions/forbidden.exception';

export class SpaceController {
    constructor(
        private readonly usecase: SpaceUsecase,
        ) {}
    
    async create (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const user_id = (req as any).user?.id;
            const space = await this.usecase.create({ ...req.body as CreateSpaceDTO, createdByUserId: user_id })

            eventBus.emit(SPACE_CREATED, { space })

            res.status(201).json(space);
        } catch (error) {
            next(error)
        }
    }

    async generateAccessToken (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const user_id = (req as any).user?.id;
            const space = await this.usecase.findById((req.body as GenerateAccessTokenDTO).spaceId)

            if(space instanceof Error) throw space;

            if(space.createdByUserId !== user_id) throw new ForbiddenException('Cannot generate token for this space')

            const result = await this.usecase.generateAccessToken({
                ...(req.body as GenerateAccessTokenDTO),
                id: user_id
            });

            res.status(201).json(result);
        } catch (error) {
            next(error)
        }
    }

    async verifyAccessToken (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const result = await this.usecase.verifyAccessToken(req.body as VerifyAccessTokenDTO);

            res.status(200).json(result);
        } catch (error) {
            next(error)
        }
    }

    async deleteById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const space = await this.usecase.findById(req.params[SPACE_PARAM]);

            if(space instanceof Error) throw space;

            const data  = {
                deactivatedAt: new Date() 
            }

            await this.usecase.update(req.params[SPACE_PARAM], data as UpdateSpaceDTO)

            eventBus.emit(SPACE_DELETED, { space })

            res.status(201).end();
        } catch (error) {
            next(error)
        }
    }

    async updateById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const space = await this.usecase.update(req.params[SPACE_PARAM], req.body as UpdateSpaceDTO)

            res.status(200).json(space);
        } catch (error) {
            next(error)
        }
    }

    async findById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const space = await this.usecase.findById(req.params[SPACE_PARAM])
            res.status(200).json(space);
        } catch (error) {
            next(error)
        }
    }

    async findMany (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const results = await this.usecase.findMany(req.query as unknown as FindManySpaceDTO)
            res.status(200).json(results);
        } catch (error) {
            next(error)
        }
    }

}