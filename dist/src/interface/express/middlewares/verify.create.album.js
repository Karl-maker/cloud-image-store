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
const not_found_1 = require("../../../application/exceptions/not.found");
const insufficent_storage_exception_1 = require("../../../application/exceptions/insufficent.storage.exception");
const verifyCreateAlbum = (spaceRepository, userRepository) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const results = yield spaceRepository.findMany({
            filters: {
                createdByUserId: {
                    exact: user_id
                }
            }
        });
        const user = yield userRepository.findById(user_id);
        if (!user)
            throw new not_found_1.NotFoundException('user not found');
        if (user.maxSpaces <= results.pagination.totalItems)
            throw new insufficent_storage_exception_1.InsufficentStorageException('limit reached');
        next();
    }
    catch (error) {
        return next(error);
    }
});
exports.default = verifyCreateAlbum;
