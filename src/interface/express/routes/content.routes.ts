import { CONTENT_PARAM_PATH, CONTENT_PATH, CREATE_VARIANT_PATH, UPLOAD_PATH } from "../../../domain/constants/api.routes";
import authentication from "../middlewares/authentication.middleware";
import { TOKEN_SECRET } from "../../../application/configuration";
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

const router = express.Router();

    /**
     * @swagger
     * tags:
     *   - name: Content
     *     description: Endpoints related to content management and actions
     */

export const ContentRoutes = (usecase: ContentUsecase) => {
    const controller = new ContentController(usecase);
    const upload = multer({ storage: multer.memoryStorage() });

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

    router.get(CONTENT_PATH + CONTENT_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.findById.bind(controller)); 

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

    router.get(CONTENT_PATH, controller.findMany.bind(controller));
    
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

    router.patch(CONTENT_PATH + CONTENT_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(updateContentSchema), controller.updateById.bind(controller));

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

    router.post(CONTENT_PATH + CONTENT_PARAM_PATH + CREATE_VARIANT_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), limitAiEnhancementMiddleware(usecase.spaceRepository, usecase.repository), validateBodyDTO(createContentVariantSchema), controller.generateVariant.bind(controller));

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

    router.delete(CONTENT_PATH + CONTENT_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.deleteById.bind(controller));

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
}

export const validateUploadEndpoint = async (req: Request, res: Response, next: NextFunction) => {
    const { error } = uploadFilesSchema.validate({ files: req.files as Express.Multer.File[], spaceId: (req.body as unknown as UploadContentDTO).spaceId }, { abortEarly: true });

    if(error) next(new ValidationException("Malformed Request"));
    next();
}