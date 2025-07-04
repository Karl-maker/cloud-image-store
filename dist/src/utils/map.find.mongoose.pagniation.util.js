"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapFindMongoosePagination = void 0;
const mapFindMongoosePagination = (pageNumber, pageSize) => {
    if (pageNumber === undefined || pageSize === undefined)
        return {};
    const safePageSize = Math.abs(pageSize); // Ensure pageSize is positive
    return {
        skip: (pageNumber - 1) * safePageSize,
        limit: safePageSize,
    };
};
exports.mapFindMongoosePagination = mapFindMongoosePagination;
