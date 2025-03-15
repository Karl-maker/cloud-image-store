import Joi from 'joi';

export const sendConfirmationEmailSchema = Joi.object({
    userId: Joi.string().required(),
});

export type SendConfirmationEmailDTO = {
    userId: string;
}