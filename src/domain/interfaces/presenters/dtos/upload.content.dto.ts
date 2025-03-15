import { Express } from 'express';
import Joi from 'joi';

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
