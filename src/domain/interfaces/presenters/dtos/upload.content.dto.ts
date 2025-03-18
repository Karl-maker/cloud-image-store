import { Express } from 'express';
import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadContentRequest:
 *       required: 
 *         - spaceId
 *         - files
 *       type: object
 *       properties:
 *         spaceId:
 *           type: string
 *           description: The space ID where the file(s) will be uploaded.
 *           example: "12345"
 *         files:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fieldname:
 *                 type: string
 *                 description: The name of the form field.
 *               originalname:
 *                 type: string
 *                 description: The original name of the file.
 *               encoding:
 *                 type: string
 *                 description: The encoding type of the file.
 *               mimetype:
 *                 type: string
 *                 description: The MIME type of the file (must be an image or video).
 *                 pattern: ^image\/.*$|^video\/.*$
 *               size:
 *                 type: integer
 *                 description: The size of the file in bytes. The maximum allowed size is 100MB.
 *                 example: 2048000
 *               buffer:
 *                 type: string
 *                 description: The file data in binary format (base64 encoded).
 *                 format: byte
 *           minItems: 1
 *           description: An array of files to be uploaded.
 */


export type UploadContentDTO = {
    files: Express.Multer.File[];
    spaceId: string;
};

export const uploadFilesSchema = Joi.object({
    spaceId: Joi.string().required(),
    files: Joi.array()
        .items(
            Joi.object({
                fieldname: Joi.string().required(), // Field name
                originalname: Joi.string().required(), // Original filename
                encoding: Joi.string().required(), // Encoding type
                mimetype: Joi.string()
                    .pattern(/^image\/.*$|^video\/.*$/) 
                    .required(),
                size: Joi.number().max(100 * 1024 * 1024).required(), 
                buffer: Joi.binary().required(), 
            })
        )
        .min(1)
        .required(), 
});
