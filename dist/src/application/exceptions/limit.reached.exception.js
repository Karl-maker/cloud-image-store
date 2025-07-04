"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitReachedException = void 0;
const http_exception_1 = require("./http.exception");
class LimitReachedException extends http_exception_1.HttpException {
    constructor(message) {
        super('Limit Reached', message, 403);
    }
}
exports.LimitReachedException = LimitReachedException;
