"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = void 0;
const http_exception_1 = require("./http.exception");
class ValidationException extends http_exception_1.HttpException {
    constructor(message) {
        super("Validation", message, 403);
    }
}
exports.ValidationException = ValidationException;
