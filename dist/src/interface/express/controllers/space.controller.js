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
exports.SpaceController = void 0;
const event_bus_1 = require("../../../infrastructure/event/event.bus");
const event_names_1 = require("../../../domain/constants/event.names");
const api_routes_1 = require("../../../domain/constants/api.routes");
const forbidden_exception_1 = require("../../../application/exceptions/forbidden.exception");
class SpaceController {
    constructor(usecase) {
        this.usecase = usecase;
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const space = yield this.usecase.create(Object.assign(Object.assign({}, req.body), { createdByUserId: user_id }));
                event_bus_1.eventBus.emit(event_names_1.SPACE_CREATED, { space });
                res.status(201).json(space);
            }
            catch (error) {
                next(error);
            }
        });
    }
    generateAccessToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const space = yield this.usecase.findById(req.body.spaceId);
                if (space instanceof Error)
                    throw space;
                if (space.createdByUserId !== user_id)
                    throw new forbidden_exception_1.ForbiddenException('Cannot generate token for this space');
                const result = yield this.usecase.generateAccessToken(Object.assign({}, req.body));
                res.status(201).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyAccessToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.usecase.verifyAccessToken(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const space = yield this.usecase.findById(req.params[api_routes_1.SPACE_PARAM]);
                if (space instanceof Error)
                    throw space;
                const data = {
                    deactivatedAt: new Date()
                };
                yield this.usecase.update(req.params[api_routes_1.SPACE_PARAM], data);
                event_bus_1.eventBus.emit(event_names_1.SPACE_DELETED, { space });
                res.status(201).end();
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const space = yield this.usecase.update(req.params[api_routes_1.SPACE_PARAM], req.body);
                res.status(200).json(space);
            }
            catch (error) {
                next(error);
            }
        });
    }
    findById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const space = yield this.usecase.findById(req.params[api_routes_1.SPACE_PARAM]);
                res.status(200).json(space);
            }
            catch (error) {
                next(error);
            }
        });
    }
    findMany(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.usecase.findMany(req.query);
                res.status(200).json(results);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.SpaceController = SpaceController;
