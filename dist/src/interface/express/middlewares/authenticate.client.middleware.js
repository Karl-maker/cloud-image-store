"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const unauthorized_exception_1 = require("../../../application/exceptions/unauthorized.exception");
const authenticateClient = (secret, jwtService) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const key = req.headers["x-api-key"];
        if (!key || typeof key !== 'string') {
            return next(new unauthorized_exception_1.UnauthorizedException("No key provided"));
        }
        const payload = yield jwtService.validate(key, secret);
        if (!payload) {
            return next(new unauthorized_exception_1.UnauthorizedException("Invalid key"));
        }
        next();
    }
    catch (error) {
        return next(new unauthorized_exception_1.UnauthorizedException("Api key validation failed"));
    }
});
exports.default = authenticateClient;
