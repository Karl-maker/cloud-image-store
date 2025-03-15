import { CONTENT_PARAM_PATH, CONTENT_PATH } from "../../../domain/constants/api.routes";
import express from "express";
import authentication from "../middlewares/authentication.middleware";
import { TOKEN_SECRET } from "../../../application/configuration";
import { JwtTokenService } from "../../../application/services/token/jwt.token.service";
import { validateDTO } from "../middlewares/validation.middleware";
import { findManySchema } from "../../../domain/interfaces/presenters/dtos/find.many.dto";
import { ContentUsecase } from "../../../domain/usecases/content.usecase";
import { ContentController } from "../controllers/content.controller";
import { contentFilterBySchema } from "../../../domain/interfaces/presenters/dtos/find.many.content.dto";
import { updateContentSchema } from "../../../domain/interfaces/presenters/dtos/update.content.dto";

const router = express.Router();

export const ContentRoutes = (usecase: ContentUsecase) => {
    const controller = new ContentController(usecase);

    router.get(CONTENT_PATH + CONTENT_PARAM_PATH, controller.findById.bind(controller)); 
    router.get(CONTENT_PATH, validateDTO(findManySchema.concat(contentFilterBySchema)), controller.findMany.bind(controller)); 
    router.patch(CONTENT_PATH + CONTENT_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateDTO(updateContentSchema), controller.updateById.bind(controller));
    router.delete(CONTENT_PATH + CONTENT_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.deleteById.bind(controller));

    return router;
}