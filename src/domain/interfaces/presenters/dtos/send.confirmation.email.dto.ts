import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     SendConfirmationEmailRequest:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user to whom the confirmation email will be sent.
 */

export const sendConfirmationEmailSchema = Joi.object({
    userId: Joi.string().required(),
});

export type SendConfirmationEmailDTO = {
    userId: string;
}