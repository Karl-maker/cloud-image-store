"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapFindMongooseSort = void 0;
const mapFindMongooseSort = (sortBy, sortOrder) => {
    if (!sortBy)
        return undefined;
    return { [sortBy]: sortOrder === "desc" ? -1 : 1 };
};
exports.mapFindMongooseSort = mapFindMongooseSort;
