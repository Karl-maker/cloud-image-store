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
 *         - spaceId
 */

export const createPaymentLinkSchema = Joi.object({
    priceId: Joi.string().required(),
    spaceId: Joi.string().required(),
});

export type CreatePaymentLinkDTO = {
    priceId: string;
    spaceId: string;
}