import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     VerifyConfirmationRequest:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: The confirmation token that needs to be verified.
 *           example: "abcd1234"
 *       required:
 *         - token
 */

export const verifyConfirmationSchema = Joi.object({
    token: Joi.string().required(),
});

export type VerifyConfirmationDTO = {
    token: string;
}