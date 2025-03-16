import { Response, Request, NextFunction } from 'express';
import { eventBus } from '../../../infrastructure/event/event.bus';
import { SPACE_CREATED, SPACE_DELETED, USER_CREATED, USER_DELETED } from '../../../domain/constants/event.names';
import { SPACE_PARAM } from '../../../domain/constants/api.routes';
import { SpaceUsecase } from '../../../domain/usecases/space.usecase';
import { CreateSpaceDTO } from '../../../domain/interfaces/presenters/dtos/create.space.dto';
import { UpdateSpaceDTO } from '../../../domain/interfaces/presenters/dtos/update.space.dto';
import { FindManySpaceDTO } from '../../../domain/interfaces/presenters/dtos/find.many.space.dto';

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

    async deleteById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const space = await this.usecase.findById(req.params[SPACE_PARAM]);
            await this.usecase.deleteById(req.params[SPACE_PARAM])

            eventBus.emit(SPACE_DELETED, { space })

            res.status(201);
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