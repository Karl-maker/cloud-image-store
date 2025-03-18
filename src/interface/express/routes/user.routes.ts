import { AUTH_PATH, CONFIRMATION_PATH, ME_PATH, RECOVER_PATH, SEND_CONFIRMATION_PATH, USER_PARAM_PATH, USER_PATH } from "../../../domain/constants/api.routes";
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

    /**
     * @swagger
     * /user/confirmation:
     *   post:
     *     tags:
     *       - User
     *     summary: Verify user confirmation
     *     description: Verifies a user's confirmation using a token.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/VerifyConfirmationRequest'
     *     responses:
     *       201:
     *         description: Confirmation verified successfully. No content returned.
     *       400:
     *         description: Invalid or missing token.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid or missing token."
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
     *       - BearerAuth: []
     */

    router.post(USER_PATH + CONFIRMATION_PATH, validateBodyDTO(verifyConfirmationSchema), controller.confirm.bind(controller)); 

    /**
     * @swagger
     * /user/me:
     *   get:
     *     tags:
     *       - User
     *     summary: Get user by bearer token
     *     description: Retrieve the details of a user by their token.
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
     */
       
    router.get(USER_PATH + ME_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.me.bind(controller)); 

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

    /**
     * @swagger
     * /user/recover:
     *   post:
     *     tags:
     *       - User
     *     summary: Recover user account
     *     description: Initiates the user account recovery process.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RecoverUserRequest'
     *     responses:
     *       201:
     *         description: Recovery request accepted. No content returned.
     *       400:
     *         description: Invalid or missing request parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid request parameters."
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
     */

    router.post(USER_PATH + RECOVER_PATH, validateBodyDTO(recoverUserSchema), controller.generateRecover.bind(controller)); 

    /**
     * @swagger
     * /user/auth:
     *   post:
     *     tags:
     *       - User
     *     summary: Authenticate user
     *     description: Logs in a user and returns an access token.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginUserRequest'
     *     responses:
     *       200:
     *         description: Successfully authenticated user.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *       400:
     *         description: Invalid credentials or missing parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid email or password."
     *       401:
     *         description: Unauthorized - incorrect credentials.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Unauthorized."
     *       500:
     *         description: Internal server error.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Internal server error."
     */

    router.post(USER_PATH + AUTH_PATH, validateBodyDTO(loginUserSchema), controller.login.bind(controller)); 

    /**
     * @swagger
     * /user:
     *   post:
     *     tags:
     *       - User
     *     summary: Register a new user
     *     description: Creates a new user in the system.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateUserRequest'
     *     responses:
     *       201:
     *         description: Successfully registered the user, no content returned.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   example: "eyFhowdihf2hjfi3e..."
     *       400:
     *         description: Bad request, invalid input.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid input data"
     *       409:
     *         description: Conflict, user already exists.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "User already exists"
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
     */

    router.post(USER_PATH, validateBodyDTO(createUserSchema), controller.register.bind(controller)); 

    /**
     * @swagger
     * /user/send-confirmation:
     *   post:
     *     tags:
     *       - User
     *     summary: Send confirmation email
     *     description: Sends a confirmation email to the user.
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       201:
     *         description: Confirmation email sent successfully.
     *       400:
     *         description: Invalid request parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid email format."
     *       401:
     *         description: Unauthorized - missing or invalid token.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Unauthorized."
     *       500:
     *         description: Internal server error.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Internal server error."
     */

    router.post(USER_PATH + SEND_CONFIRMATION_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.generateConfirmation.bind(controller)); 

    /**
     * @swagger
     * /user/{user_id}:
     *   patch:
     *     tags:
     *       - User
     *     summary: Update user by ID
     *     description: Updates user details for the specified user ID.
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: user_id
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the user to update.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateUserRequest'
     *     responses:
     *       200:
     *         description: Successfully updated user details.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserResponse'
     *       400:
     *         description: Invalid request parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid request body."
     *       401:
     *         description: Unauthorized - missing or invalid token.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Unauthorized."
     *       404:
     *         description: User not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "User not found."
     *       500:
     *         description: Internal server error.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Internal server error."
     */

    router.patch(USER_PATH + USER_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(updateUserSchema), controller.updateById.bind(controller));

    /**
     * @swagger
     * /user/{user_id}:
     *   delete:
     *     tags:
     *       - User
     *     summary: Delete user by ID
     *     description: Permanently deletes the specified user.
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: user_id
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the user to delete.
     *     responses:
     *       204:
     *         description: User successfully deleted. No content returned.
     *       401:
     *         description: Unauthorized - missing or invalid token.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Unauthorized."
     *       404:
     *         description: User not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "User not found."
     *       500:
     *         description: Internal server error.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Internal server error."
     */

    router.delete(USER_PATH + USER_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.deleteById.bind(controller));

    return router;
}