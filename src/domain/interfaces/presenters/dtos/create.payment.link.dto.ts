import Joi from 'joi';

export const createPaymentLinkSchema = Joi.object({
    priceId: Joi.string().required(),
    spaceId: Joi.string().required(),
});

export type CreatePaymentLinkDTO = {
    priceId: string;
    spaceId: string;
}