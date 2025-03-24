import Joi from "joi";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateContentVariantRequest:
 *       type: object
 *       properties:
 *         prompt:
 *           type: string
 *           description: The prompt of what you'd want to generate.
 *       required: []
 */

export const createContentVariantSchema = Joi.object({
  prompt: Joi.string().required(),
});

export type CreateContentVariantDTO = {
    contentId: string;
    prompt: string;
}