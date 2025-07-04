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
exports.Usecases = void 0;
const not_found_1 = require("../../application/exceptions/not.found");
const convert_params_to_filters_util_1 = require("../../utils/convert.params.to.filters.util");
class Usecases {
    constructor(repository) {
        this.repository = repository;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield this.mapCreateDtoToEntity(data);
            const saved = yield this.repository.save(entity);
            return saved;
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const found = yield this.repository.findById(id);
            if (!found)
                throw new not_found_1.NotFoundException('No item found to update');
            const entity = yield this.mapUpdateDtoToEntity(data, found);
            entity.id = id;
            const saved = yield this.repository.save(entity);
            return saved;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.repository.findById(id);
            if (!data)
                throw new not_found_1.NotFoundException('Item not found with id');
            return data;
        });
    }
    findMany(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const input = {
                pageNumber: params.page_number,
                pageSize: params.page_size,
                sortBy: params.by,
                sortOrder: params.order,
            };
            const objectParams = params;
            delete objectParams['page_number'];
            delete objectParams['page_size'];
            delete objectParams['by'];
            delete objectParams['order'];
            // assume everything else is filters;
            const filters = (0, convert_params_to_filters_util_1.convertToFilters)(objectParams);
            input.filters = filters;
            const data = yield this.repository.findMany(input);
            return data;
        });
    }
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const found = yield this.repository.findById(id);
            if (!found)
                throw new not_found_1.NotFoundException('Item not found with id');
            const deleted = yield this.repository.delete(found);
            if (deleted.error)
                throw deleted.error;
        });
    }
}
exports.Usecases = Usecases;
