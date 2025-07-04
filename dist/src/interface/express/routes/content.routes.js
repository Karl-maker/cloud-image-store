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
exports.validateUploadEndpoint = exports.ContentRoutes = void 0;
const api_routes_1 = require("../../../domain/constants/api.routes");
const authentication_middleware_1 = __importDefault(require("../middlewares/authentication.middleware"));
const configuration_1 = require("../../../application/configuration");
const jwt_token_service_1 = require("../../../application/services/token/jwt.token.service");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const content_controller_1 = require("../controllers/content.controller");
const update_content_dto_1 = require("../../../domain/interfaces/presenters/dtos/update.content.dto");
const upload_content_dto_1 = require("../../../domain/interfaces/presenters/dtos/upload.content.dto");
const validation_exception_1 = require("../../../application/exceptions/validation.exception");
const express_1 = __importDefault(require("express"));
const create_content_variant_dto_1 = require("../../../domain/interfaces/presenters/dtos/create.content.variant.dto");
const ai_limit_middleware_1 = require("../middlewares/ai.limit.middleware");
const authorization_middleware_1 = __importDefault(require("../middlewares/authorization.middleware"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Content
 *     description: Endpoints related to content management and actions
 */
const ContentRoutes = (usecase) => {
    const controller = new content_controller_1.ContentController(usecase);
    const s3Config = {
        region: configuration_1.REGION_AWS,
        credentials: {
            accessKeyId: configuration_1.ACCESS_KEY_ID_AWS,
            secretAccessKey: configuration_1.SECRET_ACCESS_KEY_AWS,
        }
    };
    const writeContentCheck = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
        const contentId = req.params[api_routes_1.CONTENT_PARAM];
        const content = yield usecase.repository.findById(contentId);
        if (content === null)
            return false;
        const space = yield usecase.spaceUsecase.findById(content.spaceId);
        if (space instanceof Error)
            return false;
        if (space.shareType === 'private' && space.createdByUserId !== payload.id)
            return false;
        if (!space.userIds.includes(payload.id) && space.createdByUserId !== payload.id)
            return false;
        return true;
    });
    /**
     * @swagger
     * /content/{content_id}:
     *   get:
     *     tags:
     *       - Content
     *     summary: Get content by ID
     *     description: Retrieve the content details by the specified content ID.
     *     parameters:
     *       - in: path
     *         name: content_id
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the content to retrieve.
     *     responses:
     *       200:
     *         description: Successfully retrieved content details.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ContentResponse'
     *       404:
     *         description: Content not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Content not found"
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
    router.get(api_routes_1.CONTENT_PATH + api_routes_1.CONTENT_PARAM_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), controller.findById.bind(controller));
    /**
     * @swagger
     * /content:
     *   get:
     *     tags:
     *       - Content
     *     summary: Find multiple contents with filters and pagination
     *     description: Retrieve a list of contents with pagination and filtering options.
     *     parameters:
     *       - in: query
     *         name: page_size
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 1
     *         description: The number of items per page.
     *       - in: query
     *         name: page_number
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 1
     *         description: The page number to retrieve.
     *       - in: query
     *         name: order
     *         required: true
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *         description: The order in which to sort the results (ascending or descending).
     *       - in: query
     *         name: by
     *         required: true
     *         schema:
     *           type: string
     *         description: The field by which to sort the results.
     *       - in: query
     *         name: spaceId
     *         schema:
     *           type: string
     *         description: Filter content by space ID.
     *       - in: query
     *         name: favorite
     *         schema:
     *           type: boolean
     *         description: Filter content by space ID.
     *       - in: query
     *         name: mimeType
     *         schema:
     *           type: string
     *         description: Filter content by MIME type.
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Successfully retrieved a list of contents.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/ContentResponse'
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     totalItems:
     *                       type: integer
     *                       example: 100
     *                     totalPages:
     *                       type: integer
     *                       example: 10
     *                     currentPage:
     *                       type: integer
     *                       example: 1
     *                     pageSize:
     *                       type: integer
     *                       example: 10
     *       400:
     *         description: Invalid request parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid query parameters"
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
    router.get(api_routes_1.CONTENT_PATH, controller.findMany.bind(controller));
    /**
     * @swagger
     * /content/{content_id}:
     *   patch:
     *     tags:
     *       - Content
     *     summary: Update content by ID
     *     description: Update the details of a specific content by its content ID.
     *     parameters:
     *       - in: path
     *         name: content_id
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the content to update.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateContentRequest'  # The request body schema
     *     responses:
     *       200:
     *         description: Successfully updated content details.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ContentResponse'  # Return ContentResponse after update
     *       404:
     *         description: Content not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Content not found"
     *       400:
     *         description: Invalid request body or missing parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid content data"
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
    router.patch(api_routes_1.CONTENT_PATH + api_routes_1.CONTENT_PARAM_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, validation_middleware_1.validateBodyDTO)(update_content_dto_1.updateContentSchema), controller.updateById.bind(controller));
    /**
     * @swagger
     * /content/{content_id}/generate-variant:
     *   post:
     *     tags:
     *       - Content
     *     summary: Create variant of content by ID
     *     description: Update the details of a specific content by its content ID.
     *     parameters:
     *       - in: path
     *         name: content_id
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the content to generate based on.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateContentVariantRequest'  # The request body schema
     *     responses:
     *       201:
     *         description: Successfully generate content details.
     *       404:
     *         description: Content not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Content not found"
     *       400:
     *         description: Invalid request body or missing parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid content data"
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
    router.post(api_routes_1.CONTENT_PATH + api_routes_1.CONTENT_PARAM_PATH + api_routes_1.CREATE_VARIANT_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, authorization_middleware_1.default)(writeContentCheck), (0, ai_limit_middleware_1.limitAiEnhancementMiddleware)(usecase.spaceUsecase.userRepository, usecase.repository), (0, validation_middleware_1.validateBodyDTO)(create_content_variant_dto_1.createContentVariantSchema), controller.generateVariant.bind(controller));
    /**
     * @swagger
     * /content/{content_id}:
     *   delete:
     *     tags:
     *       - Content
     *     summary: Delete content by ID
     *     description: Delete the content with the specified content ID.
     *     parameters:
     *       - in: path
     *         name: content_id
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the content to delete.
     *     responses:
     *       204:
     *         description: Successfully deleted content. No content returned.
     *       404:
     *         description: Content not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Content not found"
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
    router.delete(api_routes_1.CONTENT_PATH + api_routes_1.CONTENT_PARAM_PATH, (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService()), (0, authorization_middleware_1.default)(writeContentCheck), controller.deleteById.bind(controller));
    /**
     * @swagger
     * /content/upload:
     *   post:
     *     tags:
     *       - Content
     *     summary: Upload multiple content files (images or videos)
     *     description: Upload multiple files (images or videos) to the specified space. The files should be sent via form-data with the key 'files'.
     *     requestBody:
     *       required:
     *          - spaceId
     *          - files
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               files:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *                 description: The files to upload (multiple files).
     *               spaceId:
     *                 type: string
     *                 description: The ID of the space where the content will be uploaded.
     *     responses:
     *       201:
     *         description: Successfully uploaded the content files with no content returned.
     *       400:
     *         description: Bad request, invalid files or missing spaceId.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Invalid file types or missing spaceId"
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
    return router;
};
exports.ContentRoutes = ContentRoutes;
const validateUploadEndpoint = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = upload_content_dto_1.uploadFilesSchema.validate({ files: req.files, spaceId: req.body.spaceId }, { abortEarly: true });
    if (error)
        next(new validation_exception_1.ValidationException("Malformed Request"));
    next();
});
exports.validateUploadEndpoint = validateUploadEndpoint;
