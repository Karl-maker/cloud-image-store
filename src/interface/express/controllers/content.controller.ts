import { Response, Request, NextFunction } from 'express';
import { eventBus } from '../../../infrastructure/event/event.bus';
import { CONTENT_CREATED, CONTENT_DELETED } from '../../../domain/constants/event.names';
import { CONTENT_PARAM } from '../../../domain/constants/api.routes';
import { UpdateSpaceDTO } from '../../../domain/interfaces/presenters/dtos/update.space.dto';
import { ContentUsecase } from '../../../domain/usecases/content.usecase';
import { CreateContentDTO } from '../../../domain/interfaces/presenters/dtos/create.content.dto';
import { FindManyContentsDTO } from '../../../domain/interfaces/presenters/dtos/find.many.content.dto';
import { UploadContentDTO } from '../../../domain/interfaces/presenters/dtos/upload.content.dto';
import { getLinkForContent } from '../../../utils/get.link.for.content';
import { S3_BUCKET_NAME_AWS } from '../../../application/configuration';
import { S3ClientConfig } from '@aws-sdk/client-s3';

export class ContentController {
    constructor(
        private readonly usecase: ContentUsecase,
        ) {}
    
    async create (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const content = await this.usecase.create(req.body as CreateContentDTO)

            eventBus.emit(CONTENT_CREATED, { content })

            res.status(201).end();
        } catch (error) {
            next(error)
        }
    }

    redirectToS3 = (
        bucketName: string,
        s3Config: S3ClientConfig
    ) => async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
        try {
            const key = req.params[0];
            const rangeHeader = req.headers.range;
            const { data, stream } = await this.usecase.redirectToS3(key, bucketName, s3Config, rangeHeader)
            
            const contentType = data.ContentType || 'application/octet-stream';
            const contentLength = data.ContentLength;
            const contentRange = data.ContentRange;
    
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Range');
            res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000');
    
            if (rangeHeader && contentRange) {
                res.status(206); // Partial Content
                res.setHeader('Content-Range', contentRange);
                res.setHeader('Content-Length', contentLength?.toString() || '');
            } else {
                res.setHeader('Content-Length', contentLength?.toString() || '');
            }
    
            (data.Body as NodeJS.ReadableStream).pipe(res);
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
            res.status(201).end();
        } catch (error) {
            next(error)
        }
    }

    async deleteById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const content = await this.usecase.findById(req.params[CONTENT_PARAM]);
            await this.usecase.deleteById(req.params[CONTENT_PARAM])

            eventBus.emit(CONTENT_DELETED, { content })

            res.status(204).end();
        } catch (error) {
            next(error)
        }
    }

    async updateById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const content = await this.usecase.update(req.params[CONTENT_PARAM], req.body as UpdateSpaceDTO)
            
            content.location = getLinkForContent(content)
            content.downloadUrl = content.location;

            res.status(200).json(content);
        } catch (error) {
            next(error)
        }
    }

    async findById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const content = await this.usecase.findById(req.params[CONTENT_PARAM])
            
            if(content instanceof Error) throw content;

            content.location = getLinkForContent(content)
            content.downloadUrl = content.location;

            res.status(200).json(content);
        } catch (error) {
            next(error)
        }
    }

    async findMany (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const results = await this.usecase.findMany(req.query as unknown as FindManyContentsDTO)
            
            res.status(200).json({
                ...results,
                data: results.data.map((d) => {
                    d.location = getLinkForContent(d);
                    d.downloadUrl = d.location;

                    return d;
                })
            });

        } catch (error) {
            next(error)
        }
    }

    async generateVariant (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            await this.usecase.generateContentVariant({
                contentId: req.params[CONTENT_PARAM] as string,
                prompt: req.body
            })
            res.status(201).end();
        } catch (error) {
            next(error)
        }
    }

}