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
exports.UserController = void 0;
const event_bus_1 = require("../../../infrastructure/event/event.bus");
const event_names_1 = require("../../../domain/constants/event.names");
const api_routes_1 = require("../../../domain/constants/api.routes");
class UserController {
    constructor(usecase) {
        this.usecase = usecase;
    }
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user, accessToken } = yield this.usecase.register(req.body);
                event_bus_1.eventBus.emit(event_names_1.USER_CREATED, { user });
                res.status(201).json({
                    accessToken
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.usecase.findById(req.params[api_routes_1.USER_PARAM]);
                yield this.usecase.deleteById(req.params[api_routes_1.USER_PARAM]);
                event_bus_1.eventBus.emit(event_names_1.USER_DELETED, { user });
                res.status(204).end();
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.usecase.update(req.params[api_routes_1.USER_PARAM], req.body);
                res.status(200).json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    findById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.usecase.findById(req.params[api_routes_1.USER_PARAM]);
                res.status(200).json(user);
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
    generateConfirmation(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                yield this.usecase.sendConfirmationEmail({
                    userId: user
                });
                res.status(201).end();
            }
            catch (error) {
                next(error);
            }
        });
    }
    generateRecover(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.usecase.recover(req.body);
                res.status(201).end();
            }
            catch (error) {
                next(error);
            }
        });
    }
    confirm(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.usecase.checkConfirmationToken(req.body);
                event_bus_1.eventBus.emit(event_names_1.USER_CONFIRMED, { user });
                res.status(201).end();
            }
            catch (error) {
                next(error);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.usecase.login(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    me(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const user = yield this.usecase.findById(userId);
                res.status(200).json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.UserController = UserController;
