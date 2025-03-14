import { SPACE_PARAM_PATH, SPACE_PATH } from "../../../domain/constants/api.routes";
import express from "express";
import authentication from "../middlewares/authentication.middleware";
import { TOKEN_SECRET } from "../../../application/configuration";
import { JwtTokenService } from "../../../application/services/token/jwt.token.service";
import { validateDTO } from "../middlewares/validation.middleware";
import { findManySchema } from "../../../application/interfaces/presenters/dtos/find.many.dto";
import { SpaceUsecase } from "../../../domain/usecases/space.usecase";
import { SpaceController } from "../controllers/space.controller";
import { spaceFilterBySchema } from "../../../application/interfaces/presenters/dtos/find.many.space.dto";
import { updateSpaceSchema } from "../../../application/interfaces/presenters/dtos/update.space.dto";

const router = express.Router();

export const SpaceRoutes = (usecase: SpaceUsecase) => {
    const controller = new SpaceController(usecase);

    router.get(SPACE_PATH + SPACE_PARAM_PATH, controller.findById.bind(controller)); 
    router.get(SPACE_PATH, validateDTO(findManySchema.concat(spaceFilterBySchema)), controller.findMany.bind(controller)); 
    router.patch(SPACE_PATH + SPACE_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateDTO(updateSpaceSchema), controller.updateById.bind(controller));
    router.delete(SPACE_PATH + SPACE_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.deleteById.bind(controller));

    return router;
}