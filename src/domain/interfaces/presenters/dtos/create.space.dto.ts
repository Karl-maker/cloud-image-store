import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSpaceRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           description: Name of the space
 *         description:
 *           type: string
 *           maxLength: 1000
 *           nullable: true
 *           description: Optional description of the space
 *       required:
 *         - name
 *         - createdByUserId
 */

export const createSpaceSchema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(1000).optional()
});


export type CreateSpaceDTO = {
    name: string;
    description: string;
    createdByUserId: string;
}