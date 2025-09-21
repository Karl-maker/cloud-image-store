import { CONTENT_PARAM, CONTENT_PARAM_PATH, CONTENT_PATH, CONTENT_VIEW_PATH, CREATE_VARIANT_PATH, LINK_PARAM, LINK_PARAM_PATH, LINK_PATH, UPLOAD_PATH } from "../../../domain/constants/api.routes";
import authentication from "../middlewares/authentication.middleware";
import { ACCESS_KEY_ID_AWS, REGION_AWS, S3_BUCKET_NAME_AWS, SECRET_ACCESS_KEY_AWS, TOKEN_SECRET } from "../../../application/configuration";
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
import { createContentVariantSchema } from "../../../domain/interfaces/presenters/dtos/create.content.variant.dto";
import { limitAiEnhancementMiddleware } from "../middlewares/ai.limit.middleware";
import authorization from "../middlewares/authorization.middleware";
import { S3ClientConfig } from "@aws-sdk/client-s3";
import { rateLimiter } from "../middlewares/rate.limit";
import { LinkUsecase } from "../../../domain/usecases/link.usecase";
import { LinkController } from "../controllers/link.controller";

const router = express.Router();

    /**
     * @swagger
     * tags:
     *   - name: Link
     *     description: Endpoints related to link management and actions
     */

export const LinkRoutes = (usecase: LinkUsecase) => {
    const controller = new LinkController(usecase);

    router.get(LINK_PATH + LINK_PARAM_PATH, controller.redirect.bind(controller)); 

    return router;
}
