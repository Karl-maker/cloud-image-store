"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficentStorageException = void 0;
const http_exception_1 = require("./http.exception");
class InsufficentStorageException extends http_exception_1.HttpException {
    constructor(message) {
        super('Insufficent Storage', message, 507);
    }
}
exports.InsufficentStorageException = InsufficentStorageException;
