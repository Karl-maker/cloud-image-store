"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyConfirmationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * @swagger
 * components:
 *   schemas:
 *     VerifyConfirmationRequest:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: The confirmation token that needs to be verified.
 *           example: "abcd1234"
 *       required:
 *         - token
 */
exports.verifyConfirmationSchema = joi_1.default.object({
    token: joi_1.default.string().required(),
});
