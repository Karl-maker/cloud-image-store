import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     RecoverUserRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user requesting account recovery.
 */

export const recoverUserSchema = Joi.object({
    email: Joi.string().email().required(),
});


export type RecoverUserDTO = {
    email: string;
}
