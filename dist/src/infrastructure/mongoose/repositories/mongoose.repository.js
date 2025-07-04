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
exports.MongooseRepository = void 0;
const map_find_mongoose_filters_util_1 = require("../../../utils/map.find.mongoose.filters.util");
const map_find_mongoose_sort_util_1 = require("../../../utils/map.find.mongoose.sort.util");
const map_find_mongoose_pagniation_util_1 = require("../../../utils/map.find.mongoose.pagniation.util");
class MongooseRepository {
    constructor(db, schemaName, schema) {
        this.db = db;
        this.model = db.model(schemaName, schema);
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const found = yield this.model.findOne({
                clientId: id,
                deactivatedAt: null
            });
            return found ? this.mapModelToEntity(found) : null;
        });
    }
    findMany(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const deactivatedFilter = { deactivatedAt: null };
            const filters = Object.assign(Object.assign({}, (0, map_find_mongoose_filters_util_1.mapFindMongooseFilters)(params === null || params === void 0 ? void 0 : params.filters)), deactivatedFilter);
            const paginationOptions = (0, map_find_mongoose_pagniation_util_1.mapFindMongoosePagination)(params === null || params === void 0 ? void 0 : params.pageNumber, params === null || params === void 0 ? void 0 : params.pageSize);
            const sortOptions = (0, map_find_mongoose_sort_util_1.mapFindMongooseSort)(params === null || params === void 0 ? void 0 : params.sortBy, params === null || params === void 0 ? void 0 : params.sortOrder);
            const result = yield this.model.find(Object.assign({}, filters), {}, Object.assign({ sort: sortOptions }, paginationOptions));
            const totalItems = yield this.model.countDocuments(filters);
            const pageSize = (_a = params === null || params === void 0 ? void 0 : params.pageSize) !== null && _a !== void 0 ? _a : totalItems;
            const currentPage = (_b = params === null || params === void 0 ? void 0 : params.pageNumber) !== null && _b !== void 0 ? _b : 1;
            const totalPages = Math.ceil(totalItems / pageSize);
            return {
                data: result.map((d) => this.mapModelToEntity(d)),
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage,
                    pageSize,
                },
            };
        });
    }
    findManyIgnoreDeletion(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const filters = Object.assign({}, (0, map_find_mongoose_filters_util_1.mapFindMongooseFilters)(params === null || params === void 0 ? void 0 : params.filters));
            const paginationOptions = (0, map_find_mongoose_pagniation_util_1.mapFindMongoosePagination)(params === null || params === void 0 ? void 0 : params.pageNumber, params === null || params === void 0 ? void 0 : params.pageSize);
            const sortOptions = (0, map_find_mongoose_sort_util_1.mapFindMongooseSort)(params === null || params === void 0 ? void 0 : params.sortBy, params === null || params === void 0 ? void 0 : params.sortOrder);
            const result = yield this.model.find(Object.assign({}, filters), {}, Object.assign({ sort: sortOptions }, paginationOptions));
            const totalItems = yield this.model.countDocuments(filters);
            const pageSize = (_a = params === null || params === void 0 ? void 0 : params.pageSize) !== null && _a !== void 0 ? _a : totalItems;
            const currentPage = (_b = params === null || params === void 0 ? void 0 : params.pageNumber) !== null && _b !== void 0 ? _b : 1;
            const totalPages = Math.ceil(totalItems / pageSize);
            return {
                data: result.map((d) => this.mapModelToEntity(d)),
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage,
                    pageSize,
                },
            };
        });
    }
    save(d) {
        return __awaiter(this, void 0, void 0, function* () {
            if (d.id) {
                const updated = yield this.model.findOneAndUpdate({ clientId: d.id }, d, { new: true });
                if (!updated)
                    throw new Error('Issue updating data');
                return this.mapModelToEntity(updated);
            }
            const saved = yield this.model.create(d);
            return this.mapModelToEntity(saved);
        });
    }
    delete(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let error = undefined;
            const deleted = yield this.model.findOneAndDelete({
                clientId: data.id
            });
            return {
                data,
                error
            };
        });
    }
    mapModelToEntity(d) {
        const savedObj = Object.assign(Object.assign({}, d.toObject()), { id: d.clientId });
        delete savedObj['_id'];
        delete savedObj['__v'];
        delete savedObj['clientId'];
        return savedObj;
    }
}
exports.MongooseRepository = MongooseRepository;
