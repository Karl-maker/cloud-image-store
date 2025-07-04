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
exports.limitAiEnhancementMiddleware = void 0;
const api_routes_1 = require("../../../domain/constants/api.routes");
const insufficent_storage_exception_1 = require("../../../application/exceptions/insufficent.storage.exception");
const limitAiEnhancementMiddleware = (userRepository, contentRepository) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const contentId = req.params[api_routes_1.CONTENT_PARAM];
    const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield userRepository.findById(user_id);
    if (!user) {
        next(new Error('no user found'));
        return;
    }
    const amountAllowed = (_b = user.maxAiEnhancementsPerMonth) !== null && _b !== void 0 ? _b : 0;
    const result = yield contentRepository.findManyIgnoreDeletion({
        pageSize: 1,
        pageNumber: 1,
        filters: {
            ai: {
                exact: true
            },
            createdAt: {
                less: new Date(),
                greater: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
        }
    });
    if (result.pagination.totalItems >= amountAllowed)
        next(new insufficent_storage_exception_1.InsufficentStorageException('cannot generate more ai images'));
    next();
});
exports.limitAiEnhancementMiddleware = limitAiEnhancementMiddleware;
