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
exports.verifyUploadPermissions = void 0;
const not_found_1 = require("../../../application/exceptions/not.found");
const insufficent_storage_exception_1 = require("../../../application/exceptions/insufficent.storage.exception");
const bytes_to_mb_1 = require("../../../utils/bytes.to.mb");
const verifyUploadPermissions = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const spaceId = req.body.spaceId;
    if (!payload.spaceId && payload.id)
        return true;
    if (payload.spaceId && (spaceId !== payload.spaceId))
        return false;
    const files = req.files || [req.file];
    let hasImage = false;
    let hasVideo = false;
    for (const file of files) {
        if (!(file === null || file === void 0 ? void 0 : file.mimetype))
            continue;
        if (file.mimetype.startsWith('image/')) {
            hasImage = true;
        }
        else if (file.mimetype.startsWith('video/')) {
            hasVideo = true;
        }
    }
    if (!payload.allowPhotos && hasImage)
        return false;
    if (!payload.allowVideos && hasVideo)
        return false;
    return true;
});
exports.verifyUploadPermissions = verifyUploadPermissions;
const verifyUploadContent = (spaceRepository, userRepository) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        let user = null;
        let results = {
            data: [],
            pagination: {
                totalItems: 0,
                totalPages: 0,
                currentPage: 0,
                pageSize: 0
            }
        };
        if (user_id) {
            user = yield userRepository.findById(user_id);
            if (!user)
                throw new not_found_1.NotFoundException('user not found');
        }
        if ((_b = req.user) === null || _b === void 0 ? void 0 : _b.spaceId) {
            const space = yield spaceRepository.findById((_c = req.user) === null || _c === void 0 ? void 0 : _c.spaceId);
            if (!space)
                throw new not_found_1.NotFoundException('space not found');
            user = yield userRepository.findById(space.createdByUserId);
            if (!user)
                throw new not_found_1.NotFoundException('user not found');
        }
        if (!user)
            throw new not_found_1.NotFoundException('user not found');
        results = yield spaceRepository.findMany({
            filters: {
                createdByUserId: {
                    exact: user_id
                }
            },
        });
        let totalStorageUsed = 0;
        for (const item of results.data) {
            totalStorageUsed += item.usedMegabytes;
        }
        if (totalStorageUsed >= (0, bytes_to_mb_1.mBToBytes)(user.maxStorage))
            throw new insufficent_storage_exception_1.InsufficentStorageException('no more storage available');
        next();
    }
    catch (error) {
        return next(error);
    }
});
exports.default = verifyUploadContent;
