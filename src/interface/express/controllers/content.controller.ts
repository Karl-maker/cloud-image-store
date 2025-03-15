import { Response, Request, NextFunction } from 'express';
import { eventBus } from '../../../infrastructure/event/event.bus';
import { CONTENT_CREATED, CONTENT_DELETED } from '../../../domain/constants/event.names';
import { CONTENT_PARAM } from '../../../domain/constants/api.routes';
import { UpdateSpaceDTO } from '../../../domain/interfaces/presenters/dtos/update.space.dto';
import { ContentUsecase } from '../../../domain/usecases/content.usecase';
import { CreateContentDTO } from '../../../domain/interfaces/presenters/dtos/create.content.dto';
import { FindManyContentsDTO } from '../../../domain/interfaces/presenters/dtos/find.many.content.dto';
import { UploadContentDTO } from '../../../domain/interfaces/presenters/dtos/upload.content.dto';

export class ContentController {
    constructor(
        private readonly usecase: ContentUsecase,
        ) {}
    
    async create (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const content = await this.usecase.create(req.body as CreateContentDTO)

            eventBus.emit(CONTENT_CREATED, { content })

            res.status(201);
        } catch (error) {
            next(error)
        }
    }

    async upload (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            await this.usecase.upload({
                spaceId: (req.body as unknown as UploadContentDTO).spaceId,
                files: req.files as Express.Multer.File[]
            })

            res.status(201);
        } catch (error) {
            next(error)
        }
    }

    async deleteById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const content = await this.usecase.findById(req.params[CONTENT_PARAM]);
            await this.usecase.deleteById(req.params[CONTENT_PARAM])

            eventBus.emit(CONTENT_DELETED, { content })

            res.status(201);
        } catch (error) {
            next(error)
        }
    }

    async updateById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const content = await this.usecase.update(req.params[CONTENT_PARAM], req.body as UpdateSpaceDTO)

            res.status(200).json({ data: content });
        } catch (error) {
            next(error)
        }
    }

    async findById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const content = await this.usecase.findById(req.params[CONTENT_PARAM])
            res.status(200).json(content);
        } catch (error) {
            next(error)
        }
    }

    async findMany (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const results = await this.usecase.findMany(req.query as unknown as FindManyContentsDTO)
            res.status(200).json(results);
        } catch (error) {
            next(error)
        }
    }

}