import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePaymentLinkRequest:
 *       type: object
 *       properties:
 *         priceId:
 *           type: string
 *           description: The ID of the price for the payment link.
 *         spaceId:
 *           type: string
 *           description: The ID of the space associated with the payment link.
 *       required:
 *         - priceId
 */

export const createPaymentLinkSchema = Joi.object({
    priceId: Joi.string().required(),
    spaceId: Joi.string().optional(),
});

export type CreatePaymentLinkDTO = {
    priceId: string;
    spaceId?: string;
}