"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQueryDTO = exports.validateBodyDTO = void 0;
const validation_exception_1 = require("../../../application/exceptions/validation.exception");
const validateBodyDTO = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        next(new validation_exception_1.ValidationException("Malformed Request"));
    }
    next();
};
exports.validateBodyDTO = validateBodyDTO;
const validateQueryDTO = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    if (error) {
        next(new validation_exception_1.ValidationException("Malformed Request"));
    }
    next();
};
exports.validateQueryDTO = validateQueryDTO;
