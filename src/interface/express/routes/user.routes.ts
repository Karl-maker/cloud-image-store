import { CONFIRMATION_PATH, USER_PARAM_PATH, USER_PATH } from "../../../domain/constants/api.routes";
import { UserUsecase } from "../../../domain/usecases/user.usecase";
import express from "express";
import authentication from "../middlewares/authentication.middleware";
import { TOKEN_SECRET } from "../../../application/configuration";
import { JwtTokenService } from "../../../application/services/token/jwt.token.service";
import { validateQueryDTO, validateBodyDTO } from "../middlewares/validation.middleware";
import { createUserSchema } from "../../../domain/interfaces/presenters/dtos/create.user.dto";
import { UserController } from "../controllers/user.controller";
import { findManySchema } from "../../../domain/interfaces/presenters/dtos/find.many.dto";
import { userFilterBySchema } from "../../../domain/interfaces/presenters/dtos/find.many.user.dto";
import { updateUserSchema } from "../../../domain/interfaces/presenters/dtos/update.user.dto";
import { sendConfirmationEmailSchema } from "../../../domain/interfaces/presenters/dtos/send.confirmation.email.dto";
import { verifyConfirmationSchema } from "../../../domain/interfaces/presenters/dtos/verify.confirmation.dto";

const router = express.Router();

export const UserRoutes = (usecase: UserUsecase) => {
    const controller = new UserController(usecase);

    router.get(USER_PATH + CONFIRMATION_PATH, validateQueryDTO(verifyConfirmationSchema), controller.confirm.bind(controller)); 
    router.get(USER_PATH + USER_PARAM_PATH, controller.findById.bind(controller)); 
    router.get(USER_PATH, validateQueryDTO(findManySchema.concat(userFilterBySchema)), controller.findMany.bind(controller)); 
    router.post(USER_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(createUserSchema), controller.register.bind(controller)); 
    router.post(USER_PATH + CONFIRMATION_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(sendConfirmationEmailSchema), controller.generateConfirmation.bind(controller)); 
    router.patch(USER_PATH + USER_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(updateUserSchema), controller.updateById.bind(controller));
    router.delete(USER_PATH + USER_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.deleteById.bind(controller));

    return router;
}