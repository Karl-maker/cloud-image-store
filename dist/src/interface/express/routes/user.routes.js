"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const api_routes_1 = require("../../../domain/constants/api.routes");
const express_1 = __importDefault(require("express"));
const authentication_middleware_1 = __importDefault(require("../middlewares/authentication.middleware"));
const configuration_1 = require("../../../application/configuration");
const jwt_token_service_1 = require("../../../application/services/token/jwt.token.service");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const create_user_dto_1 = require("../../../domain/interfaces/presenters/dtos/create.user.dto");
const user_controller_1 = require("../controllers/user.controller");
const update_user_dto_1 = require("../../../domain/interfaces/presenters/dtos/update.user.dto");
const verify_confirmation_dto_1 = require("../../../domain/interfaces/presenters/dtos/verify.confirmation.dto");
const recover_user_dto_1 = require("../../../domain/interfaces/presenters/dtos/recover.user.dto");
const login_user_dto_1 = require("../../../domain/interfaces/presenters/dtos/login.user.dto");
const authorization_middleware_1 = __importDefault(require("../middlewares/authorization.middleware"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Endpoints related to user management and actions
 */
const UserRoutes = (usecase) => {
    const controller = new user_controller_1.UserController(usecase);
    const writeUserCheck = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.params[api_routes_1.USER_PARAM];
        const user = yield usecase.repository.findById(userId);
        if (user === null)
            return false;
        if (user.id !== payload.id)
            return false;
        return true;
    });
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
     */
    router.post(api_routes_1.USER_PATH + api_routes_1.CONFIRMATION_PATH, (0, validation_middleware_1.validateBodyDTO)(verify_confirmation_dto_1.verifyConfirmationSchema), controller.confirm.bind(controller));
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
    router.get(api_routes_1.USER_PATH + api_routes_1.ME_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), controller.me.bind(controller));
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
    router.get(api_routes_1.USER_PATH + api_routes_1.USER_PARAM_PATH, controller.findById.bind(controller));
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
     */
    router.get(api_routes_1.USER_PATH, controller.findMany.bind(controller));
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
    router.post(api_routes_1.USER_PATH + api_routes_1.RECOVER_PATH, (0, validation_middleware_1.validateBodyDTO)(recover_user_dto_1.recoverUserSchema), controller.generateRecover.bind(controller));
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
    router.post(api_routes_1.USER_PATH + api_routes_1.AUTH_PATH, (0, validation_middleware_1.validateBodyDTO)(login_user_dto_1.loginUserSchema), controller.login.bind(controller));
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
    router.post(api_routes_1.USER_PATH, (0, validation_middleware_1.validateBodyDTO)(create_user_dto_1.createUserSchema), controller.register.bind(controller));
    /**
     * @swagger
     * /user/send-confirmation:
     *   post:
     *     tags:
     *       - User
     *     summary: Send confirmation email
     *     description: Sends a confirmation email to the user.
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
    router.post(api_routes_1.USER_PATH + api_routes_1.SEND_CONFIRMATION_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), controller.generateConfirmation.bind(controller));
    /**
     * @swagger
     * /user/{user_id}:
     *   patch:
     *     tags:
     *       - User
     *     summary: Update user by ID
     *     description: Updates user details for the specified user ID.
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
    router.patch(api_routes_1.USER_PATH + api_routes_1.USER_PARAM_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, authorization_middleware_1.default)(writeUserCheck), (0, validation_middleware_1.validateBodyDTO)(update_user_dto_1.updateUserSchema), controller.updateById.bind(controller));
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
    router.delete(api_routes_1.USER_PATH + api_routes_1.USER_PARAM_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, authorization_middleware_1.default)(writeUserCheck), controller.deleteById.bind(controller));
    return router;
};
exports.UserRoutes = UserRoutes;
