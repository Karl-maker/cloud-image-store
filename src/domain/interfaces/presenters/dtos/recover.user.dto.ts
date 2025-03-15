import Joi from 'joi';

export const recoverUserSchema = Joi.object({
    email: Joi.string().email().required(),
});


export type RecoverUserDTO = {
    email: string;
}
