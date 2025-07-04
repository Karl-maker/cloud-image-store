"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenException = void 0;
const http_exception_1 = require("./http.exception");
class ForbiddenException extends http_exception_1.HttpException {
    constructor(message) {
        super("Forbidden", message, 403);
    }
}
exports.ForbiddenException = ForbiddenException;
