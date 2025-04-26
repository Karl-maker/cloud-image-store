import Joi from "joi";

export interface VerifyAccessTokenDTO {
    token: string;
}

export const verifyAccessTokenSchema = Joi.object({
    token: Joi.string().required(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ValidateSpaceTokenRequest:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Token for accessing space
 *       required:
 *         - token
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ValidateSpaceTokenResponse:
 *       type: object
 *       properties:
 *         timezone:
 *           type: string
 *           description: Timezone of datetimes (e.g., "America/New_York")
 *         instructions:
 *           type: string
 *           description: Special instructions or notes
 *         allowPhotos:
 *           type: boolean
 *           description: Whether taking photos is allowed
 *         allowVideos:
 *           type: boolean
 *           description: Whether taking videos is allowed
 *         start:
 *           type: string
 *           description: Start date in format YYYY-MM-DD
 *         end:
 *           type: string
 *           description: End date in format YYYY-MM-DD
 *         spaceId:
 *           type: string
 *           description: ID of the space
 *       required:
 *         - timezone
 *         - allowPhotos
 *         - allowVideos
 *         - start
 *         - end
 *         - spaceId
 */
