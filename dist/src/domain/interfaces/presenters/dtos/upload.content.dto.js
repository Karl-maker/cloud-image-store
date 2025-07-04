"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFilesSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.uploadFilesSchema = joi_1.default.object({
    spaceId: joi_1.default.string().required(),
    files: joi_1.default.array()
        .items(joi_1.default.object({
        fieldname: joi_1.default.string().required(), // Field name
        originalname: joi_1.default.string().required(), // Original filename
        encoding: joi_1.default.string().required(), // Encoding type
        mimetype: joi_1.default.string()
            .pattern(/^image\/.*$|^video\/.*$/)
            .required(),
        size: joi_1.default.number().max(100 * 1024 * 1024).required(),
        buffer: joi_1.default.binary().required(),
    }))
        .min(1)
        .required(),
});
