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
exports.SpaceRoutes = void 0;
const api_routes_1 = require("../../../domain/constants/api.routes");
const express_1 = __importDefault(require("express"));
const authentication_middleware_1 = __importDefault(require("../middlewares/authentication.middleware"));
const configuration_1 = require("../../../application/configuration");
const jwt_token_service_1 = require("../../../application/services/token/jwt.token.service");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const space_controller_1 = require("../controllers/space.controller");
const create_space_dto_1 = require("../../../domain/interfaces/presenters/dtos/create.space.dto");
const verify_create_album_1 = __importDefault(require("../middlewares/verify.create.album"));
const verify_space_access_token_dto_1 = require("../../../domain/interfaces/presenters/dtos/verify.space.access.token.dto");
const generate_space_access_token_dto_1 = require("../../../domain/interfaces/presenters/dtos/generate.space.access.token.dto");
const authorization_middleware_1 = __importDefault(require("../middlewares/authorization.middleware"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Space
 *     description: Endpoints related to space management and actions
 */
const SpaceRoutes = (usecase) => {
    const controller = new space_controller_1.SpaceController(usecase);
    const writeSpaceCheck = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
        const spaceId = req.params[api_routes_1.SPACE_PARAM];
        const space = yield usecase.repository.findById(spaceId);
        if (space === null)
            return false;
        if (space.shareType === 'private' && space.createdByUserId !== payload.id)
            return false;
        if (!space.userIds.includes(payload.id) && space.createdByUserId !== payload.id)
            return false;
        return true;
    });
    const writeSpaceTokenGenCheck = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
        const spaceId = req.body.spaceId;
        const space = yield usecase.repository.findById(spaceId);
        if (space === null)
            return false;
        if (space.shareType === 'private' && space.createdByUserId !== payload.id)
            return false;
        if (!space.userIds.includes(payload.id) && space.createdByUserId !== payload.id)
            return false;
        return true;
    });
    /**
     * @swagger
     * /space-token-generation:
     *   post:
     *     tags:
     *       - Space
     *     summary: Create a new space
     *     description: Create a new space using the provided data. Returns the details of the newly created space.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/GenerateSpaceTokenRequest'
     *     responses:
     *       201:
     *         description: Successfully created the space's token.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/GenerateSpaceTokenResponse'
     *       400:
     *         description: Bad request, missing or invalid data in the request body.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid data provided"
     *       401:
     *         description: Unauthorized, invalid or missing authentication token.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
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
    router.post(api_routes_1.SPACE_PATH + "-token-generation", (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, authorization_middleware_1.default)(writeSpaceTokenGenCheck), (0, validation_middleware_1.validateBodyDTO)(generate_space_access_token_dto_1.createSpaceTokenRequestSchema), controller.generateAccessToken.bind(controller));
    /**
     * @swagger
     * /space-token-validation:
     *   post:
     *     tags:
     *       - Space
     *     summary: Verify space token
     *     description: Verify the token for a space and get back information.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ValidateSpaceTokenRequest'
     *     responses:
     *       200:
     *         description: Successfully validated the space's token.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidateSpaceTokenResponse'
     *       400:
     *         description: Bad request, missing or invalid data in the request body.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid data provided"
     *       401:
     *         description: Unauthorized, invalid or missing authentication token.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
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
    router.post(api_routes_1.SPACE_PATH + "-token-validation", (0, validation_middleware_1.validateBodyDTO)(verify_space_access_token_dto_1.verifyAccessTokenSchema), controller.verifyAccessToken.bind(controller));
    /**
     * @swagger
     * /space:
     *   post:
     *     tags:
     *       - Space
     *     summary: Create a new space
     *     description: Create a new space using the provided data. Returns the details of the newly created space.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateSpaceRequest'
     *     responses:
     *       201:
     *         description: Successfully created the space.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SpaceResponse'
     *       400:
     *         description: Bad request, missing or invalid data in the request body.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid data provided"
     *       401:
     *         description: Unauthorized, invalid or missing authentication token.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
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
    router.post(api_routes_1.SPACE_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, verify_create_album_1.default)(usecase.repository, usecase.userRepository), (0, validation_middleware_1.validateBodyDTO)(create_space_dto_1.createSpaceSchema), controller.create.bind(controller));
    /**
     * @swagger
     * /space/{space_id}:
     *   get:
     *     tags:
     *       - Space
     *     summary: Get space by ID
     *     description: Retrieve the details of a space by the specified space ID.
     *     parameters:
     *       - in: path
     *         name: space_id
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the space to retrieve.
     *     responses:
     *       200:
     *         description: Successfully retrieved space details.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SpaceResponse'
     *       404:
     *         description: Space not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Space not found"
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
    router.get(api_routes_1.SPACE_PATH + api_routes_1.SPACE_PARAM_PATH, controller.findById.bind(controller));
    /**
     * @swagger
     * /space:
     *   get:
     *     tags:
     *       - Space
     *     summary: Get multiple spaces with filters and pagination
     *     description: Retrieve a list of spaces with the ability to filter and paginate the results.
     *     parameters:
     *       - in: query
     *         name: page_size
     *         required: true
     *         schema:
     *           type: integer
     *         description: The number of spaces per page for pagination.
     *       - in: query
     *         name: page_number
     *         required: true
     *         schema:
     *           type: integer
     *         description: The page number for pagination.
     *       - in: query
     *         name: order
     *         required: true
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *         description: The sort order. Can be `asc` (ascending) or `desc` (descending).
     *       - in: query
     *         name: by
     *         required: true
     *         schema:
     *           type: string
     *           enum: [createdAt, name, totalMegabytes, usedMegabytes]
     *         description: The field by which to sort the spaces. Options are `createdAt`, `name`, `totalMegabytes`, or `usedMegabytes`.
     *       - in: query
     *         name: userIds
     *         required: false
     *         schema:
     *           type: string
     *         description: A comma-separated list of user IDs to filter spaces by.
     *       - in: query
     *         name: createdByUserId
     *         required: false
     *         schema:
     *           type: string
     *         description: The user ID that created the space.
     *       - in: query
     *         name: subscriptionPlanId
     *         required: false
     *         schema:
     *           type: string
     *         description: The subscription plan ID associated with the space.
     *       - in: query
     *         name: name
     *         required: false
     *         schema:
     *           type: string
     *         description: The name of space.
     *     responses:
     *       200:
     *         description: Successfully retrieved list of spaces.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/SpaceResponse'
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
    router.get(api_routes_1.SPACE_PATH, controller.findMany.bind(controller));
    /**
     * @swagger
     * /space/{space_id}:
     *   patch:
     *     tags:
     *       - Space
     *     summary: Update space details by ID
     *     description: Update the details of an existing space by its ID.
     *     parameters:
     *       - in: path
     *         name: space_id
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the space to update.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateSpaceRequest'
     *     responses:
     *       200:
     *         description: Successfully updated space details.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SpaceResponse'
     *       400:
     *         description: Bad request due to invalid input.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid request body"
     *       404:
     *         description: Space not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Space not found"
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
    router.patch(api_routes_1.SPACE_PATH + api_routes_1.SPACE_PARAM_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), 
    //validateBodyDTO(updateSpaceSchema), 
    (0, authorization_middleware_1.default)(writeSpaceCheck), controller.updateById.bind(controller));
    /**
     * @swagger
     * /space/{space_id}:
     *   delete:
     *     tags:
     *       - Space
     *     summary: Delete space by ID
     *     description: Delete the space with the specified `space_id`.
     *     parameters:
     *       - in: path
     *         name: space_id
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the space to delete.
     *     responses:
     *       204:
     *         description: Successfully deleted the space. No content is returned.
     *       404:
     *         description: Space not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Space not found"
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
    router.delete(api_routes_1.SPACE_PATH + api_routes_1.SPACE_PARAM_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, authorization_middleware_1.default)(writeSpaceCheck), controller.deleteById.bind(controller));
    return router;
};
exports.SpaceRoutes = SpaceRoutes;
