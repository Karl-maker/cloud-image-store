import { SPACE_PARAM_PATH, SPACE_PATH } from "../../../domain/constants/api.routes";
import express from "express";
import authentication from "../middlewares/authentication.middleware";
import { TOKEN_SECRET } from "../../../application/configuration";
import { JwtTokenService } from "../../../application/services/token/jwt.token.service";
import { validateBodyDTO, validateQueryDTO } from "../middlewares/validation.middleware";
import { findManySchema } from "../../../domain/interfaces/presenters/dtos/find.many.dto";
import { SpaceUsecase } from "../../../domain/usecases/space.usecase";
import { SpaceController } from "../controllers/space.controller";
import { spaceFilterBySchema } from "../../../domain/interfaces/presenters/dtos/find.many.space.dto";
import { updateSpaceSchema } from "../../../domain/interfaces/presenters/dtos/update.space.dto";
import { createSpaceSchema } from "../../../domain/interfaces/presenters/dtos/create.space.dto";

const router = express.Router();

    /**
     * @swagger
     * tags:
     *   - name: Space
     *     description: Endpoints related to space management and actions
     */

export const SpaceRoutes = (usecase: SpaceUsecase) => {
    const controller = new SpaceController(usecase);

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
     *     security:
     *       - BearerAuth: []  # Bearer token authentication required
     */

    router.post(SPACE_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(createSpaceSchema), controller.create.bind(controller)); 

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
     *     security:
     *       - BearerAuth: []  # Bearer token authentication required
     */

    router.get(SPACE_PATH + SPACE_PARAM_PATH, controller.findById.bind(controller)); 

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
     *     security:
     *       - BearerAuth: []  # Bearer token authentication required
     */

        
    router.get(SPACE_PATH, validateQueryDTO(findManySchema.concat(spaceFilterBySchema)), controller.findMany.bind(controller)); 

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
     *     security:
     *       - BearerAuth: []  # Bearer token authentication required
     */


    router.patch(SPACE_PATH + SPACE_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), validateBodyDTO(updateSpaceSchema), controller.updateById.bind(controller));

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
     *     security:
     *       - BearerAuth: []  # Bearer token authentication required
     */

    router.delete(SPACE_PATH + SPACE_PARAM_PATH, authentication(TOKEN_SECRET!, new JwtTokenService()), controller.deleteById.bind(controller));

    return router;
}