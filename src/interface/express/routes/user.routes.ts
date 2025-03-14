import { USER_PARAM_PATH, USER_PATH } from "../../../domain/constants/api.routes";
import { UserUsecase } from "../../../domain/usecases/user.usecase";
import express from "express";
import authentication from "../middlewares/authentication.middleware";
import { TOKEN_SECRET } from "../../../application/configuration";
import { JwtTokenService } from "../../../application/services/token/jwt.token.service";
import { validateDTO } from "../middlewares/validation.middleware";
import { createUserSchema } from "../../../application/interfaces/presenters/dtos/create.user.dto";
import { UserController } from "../controllers/user.controller";
import { findManySchema } from "../../../application/interfaces/presenters/dtos/find.many.dto";
import { userFilterBySchema } from "../../../application/interfaces/presenters/dtos/find.many.user.dto";
import { updateUserSchema } from "../../../application/interfaces/presenters/dtos/update.user.dto";

const router = express.Router();

export const UserRoutes = (usecase: UserUsecase) => {
    const controller = new UserController(usecase);

    router.get(USER_PATH + USER_PARAM_PATH, controller.findById.bind(controller)); 
    router.get(USER_PATH, validateDTO(findManySchema.concat(userFilterBySchema)), controller.findMany.bind(controller)); 
    router.post(USER_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateDTO(createUserSchema), controller.register.bind(controller)); 
    router.patch(USER_PATH + USER_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateDTO(updateUserSchema), controller.updateById.bind(controller));
    router.delete(USER_PATH + USER_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.deleteById.bind(controller));

    return router;
}