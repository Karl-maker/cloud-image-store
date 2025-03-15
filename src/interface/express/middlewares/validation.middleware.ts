import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { ValidationException } from "../../../application/exceptions/validation.exception";

export const validateBodyDTO =
    (schema: ObjectSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            next(new ValidationException("Malformed Request"));
        }

        next();
    };

export const validateQueryDTO =
    (schema: ObjectSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.query, { abortEarly: false });

        if (error) {
            next(new ValidationException("Malformed Request"));
        }

        next();
    };