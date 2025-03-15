import Joi from 'joi';

export const verifyConfirmationSchema = Joi.object({
    token: Joi.string().required(),
});

export type VerifyConfirmationDTO = {
    token: string;
}