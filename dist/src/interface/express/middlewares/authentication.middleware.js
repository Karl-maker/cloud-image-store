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
const bearer_token_util_1 = require("../../../utils/bearer.token.util");
const authentication = (secret, jwtService, passive = false) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = (0, bearer_token_util_1.extractBearerToken)(req);
        if (!token) {
            if (passive)
                return next();
            return next(new unauthorized_exception_1.UnauthorizedException("No token provided"));
        }
        const payload = yield jwtService.validate(token, secret);
        if (!(payload === null || payload === void 0 ? void 0 : payload.id)) {
            if (payload)
                req.user = payload;
            if (passive)
                return next();
            return next(new unauthorized_exception_1.UnauthorizedException("Invalid token"));
        }
        req.user = payload;
        next();
    }
    catch (error) {
        return next(new unauthorized_exception_1.UnauthorizedException("Token validation failed"));
    }
});
exports.default = authentication;
