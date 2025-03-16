import { AUTH_PATH, CONFIRMATION_PATH, RECOVER_PATH, USER_PARAM_PATH, USER_PATH } from "../../../domain/constants/api.routes";
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
import { recoverUserSchema } from "../../../domain/interfaces/presenters/dtos/recover.user.dto";
import { loginUserSchema } from "../../../domain/interfaces/presenters/dtos/login.user.dto";

const router = express.Router();

    /**
     * @swagger
     * tags:
     *   - name: User
     *     description: Endpoints related to user management and actions
     */


export const UserRoutes = (usecase: UserUsecase) => {
    const controller = new UserController(usecase);

    router.get(USER_PATH + CONFIRMATION_PATH, validateQueryDTO(verifyConfirmationSchema), controller.confirm.bind(controller)); 

    /**
     * @swagger
     * /user/{user_id}:
     *   get:
     *     tags:
     *       - User
     *     summary: Get user by ID
     *     description: Retrieve the details of a user by their unique `user_id`.
     *     parameters:
     *       - in: path
     *         name: user_id
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the user to retrieve.
     *     responses:
     *       200:
     *         description: Successfully retrieved user details.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserResponse'
     *       404:
     *         description: User not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "User not found"
     *       500:
     *         description: Internal server error.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     *     security:
     *       - BearerAuth: []  # Bearer token authentication required
     */
        
    router.get(USER_PATH + USER_PARAM_PATH, controller.findById.bind(controller)); 

    /**
     * @swagger
     * /user:
     *   get:
     *     tags:
     *       - User
     *     summary: Get multiple users
     *     description: Retrieve a list of users with optional filters, pagination, and sorting.
     *     parameters:
     *       - in: query
     *         name: page_size
     *         required: true
     *         schema:
     *           type: integer
     *           example: 10
     *         description: Number of users per page.
     *       - in: query
     *         name: page_number
     *         required: true
     *         schema:
     *           type: integer
     *           example: 1
     *         description: The page number to retrieve.
     *       - in: query
     *         name: order
     *         required: true
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *           example: "asc"
     *         description: Sorting order (either ascending or descending).
     *       - in: query
     *         name: by
     *         required: true
     *         schema:
     *           type: string
     *           enum: [firstName, lastName, email, confirmed]
     *           example: "firstName"
     *         description: Field to sort by.
     *       - in: query
     *         name: firstName
     *         required: false
     *         schema:
     *           type: string
     *           example: "John"
     *         description: Filter users by first name.
     *       - in: query
     *         name: lastName
     *         required: false
     *         schema:
     *           type: string
     *           example: "Doe"
     *         description: Filter users by last name.
     *       - in: query
     *         name: email
     *         required: false
     *         schema:
     *           type: string
     *           example: "john.doe@example.com"
     *         description: Filter users by email.
     *       - in: query
     *         name: confirmed
     *         required: false
     *         schema:
     *           type: boolean
     *           example: true
     *         description: Filter users by confirmation status.
     *     responses:
     *       200:
     *         description: Successfully retrieved a list of users.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/UserResponse'
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     totalItems:
     *                       type: integer
     *                     totalPages:
     *                       type: integer
     *                     currentPage:
     *                       type: integer
     *                     pageSize:
     *                       type: integer
     *       400:
     *         description: Invalid input parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid input parameters"
     *       500:
     *         description: Internal server error.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     *     security:
     *       - BearerAuth: []  # Bearer token authentication required
     */

    router.get(USER_PATH, validateQueryDTO(findManySchema.concat(userFilterBySchema)), controller.findMany.bind(controller)); 
    router.post(USER_PATH + RECOVER_PATH, validateBodyDTO(recoverUserSchema), controller.generateRecover.bind(controller)); 
    router.post(USER_PATH + AUTH_PATH, validateBodyDTO(loginUserSchema), controller.login.bind(controller)); 
    router.post(USER_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(createUserSchema), controller.register.bind(controller)); 
    router.post(USER_PATH + CONFIRMATION_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(sendConfirmationEmailSchema), controller.generateConfirmation.bind(controller)); 
    router.patch(USER_PATH + USER_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(updateUserSchema), controller.updateById.bind(controller));
    router.delete(USER_PATH + USER_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.deleteById.bind(controller));

    return router;
}