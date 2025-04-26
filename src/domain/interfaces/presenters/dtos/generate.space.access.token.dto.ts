import Joi from 'joi';

export const createSpaceTokenRequestSchema = Joi.object({
  timezone: Joi.string().required(),
  instructions: Joi.string().optional(),
  allowPhotos: Joi.boolean().required(),
  allowVideos: Joi.boolean().required(),
  start: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Start must be in YYYY-MM-DD format',
    }),
  end: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'End must be in YYYY-MM-DD format',
    }),
  spaceId: Joi.string().required()
});

export interface GenerateAccessTokenDTO {
    timezone: string;
    instuctions?: string;
    allowPhotos: boolean;
    allowVideos: boolean;
    start: string;
    end: string;
    spaceId: string;
    id: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     GenerateSpaceTokenResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Token for accessing space
 *       required:
 *         - accessToken
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GenerateSpaceTokenRequest:
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
