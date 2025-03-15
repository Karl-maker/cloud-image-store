import { CONTENT_PARAM_PATH, CONTENT_PATH, UPLOAD_PATH } from "../../../domain/constants/api.routes";
import authentication from "../middlewares/authentication.middleware";
import { TOKEN_SECRET } from "../../../application/configuration";
import { JwtTokenService } from "../../../application/services/token/jwt.token.service";
import { validateQueryDTO, validateBodyDTO } from "../middlewares/validation.middleware";
import { findManySchema } from "../../../domain/interfaces/presenters/dtos/find.many.dto";
import { ContentUsecase } from "../../../domain/usecases/content.usecase";
import { ContentController } from "../controllers/content.controller";
import { contentFilterBySchema } from "../../../domain/interfaces/presenters/dtos/find.many.content.dto";
import { updateContentSchema } from "../../../domain/interfaces/presenters/dtos/update.content.dto";
import multer from "multer";
import { UploadContentDTO, uploadFilesSchema } from "../../../domain/interfaces/presenters/dtos/upload.content.dto";
import { ValidationException } from "../../../application/exceptions/validation.exception";
import express, { Response, Request, NextFunction } from 'express';

const router = express.Router();

export const ContentRoutes = (usecase: ContentUsecase) => {
    const controller = new ContentController(usecase);
    const upload = multer({ storage: multer.memoryStorage() });

    router.get(CONTENT_PATH + CONTENT_PARAM_PATH, controller.findById.bind(controller)); 
    router.get(CONTENT_PATH, validateQueryDTO(findManySchema.concat(contentFilterBySchema)), controller.findMany.bind(controller)); 
    router.patch(CONTENT_PATH + CONTENT_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(updateContentSchema), controller.updateById.bind(controller));
    router.delete(CONTENT_PATH + CONTENT_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.deleteById.bind(controller));
    router.post(CONTENT_PATH + UPLOAD_PATH, upload.array('files', 5), authentication(TOKEN_SECRET!, new JwtTokenService()), validateUploadEndpoint, controller.upload.bind(controller))

    return router;
}

const validateUploadEndpoint = async (req: Request, res: Response, next: NextFunction) => {
    const { error } = uploadFilesSchema.validate({ files: req.files as Express.Multer.File[], spaceId: (req.body as unknown as UploadContentDTO).spaceId }, { abortEarly: true });

    if(error) next(new ValidationException("Malformed Request"));
    next();
}