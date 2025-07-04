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
exports.SpaceUsecase = void 0;
const usecases_1 = require("./usecases");
const jwt_token_service_1 = require("../../application/services/token/jwt.token.service");
const configuration_1 = require("../../application/configuration");
const jwt_time_util_1 = require("../../utils/jwt.time.util");
const date_fns_tz_1 = require("date-fns-tz");
const unauthorized_exception_1 = require("../../application/exceptions/unauthorized.exception");
class SpaceUsecase extends usecases_1.Usecases {
    constructor(repository, userRepository) {
        super(repository);
        this.userRepository = userRepository;
    }
    mapCreateDtoToEntity(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const space = {
                id: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                name: data.name,
                description: data.description,
                userIds: [],
                createdByUserId: data.createdByUserId,
                usedMegabytes: 0,
                shareType: data.shareType,
            };
            return space;
        });
    }
    mapUpdateDtoToEntity(data, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const space = Object.assign(Object.assign({}, item), data);
            return space;
        });
    }
    addMemory(spaceId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repository.addUsedMegabytes(spaceId, amount);
        });
    }
    generateAccessToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { timezone, start, end } = data;
            // Parse the start and end dates considering the timezone
            const startDateUtc = (0, date_fns_tz_1.toZonedTime)(`${start}`, timezone); // (`${start}T00:00:00`, timezone);
            const endDateUtc = (0, date_fns_tz_1.toZonedTime)(`${end}`, timezone); //(`${end}T23:59:59`, timezone);
            const startTimestamp = Math.floor(startDateUtc.getTime() / 1000);
            const endTimestamp = Math.floor(endDateUtc.getTime() / 1000);
            const config = {
                issuer: "collaboration",
                exp: (60 * 60 * 24 * 2) + (0, jwt_time_util_1.dateToJwtExp)(endDateUtc), // expiration time (end of day in seconds)
                //nbf: dateToJwtExp(startDateUtc), // not before time (start of day in seconds)
                audience: 'cloud-photo-share',
            };
            const secret = configuration_1.TOKEN_SECRET;
            const token = yield new jwt_token_service_1.JwtTokenService().generate(data, secret, config);
            return {
                accessToken: token
            };
        });
    }
    verifyAccessToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.token) {
                throw new unauthorized_exception_1.UnauthorizedException("No token provided");
            }
            const jwtService = new jwt_token_service_1.JwtTokenService();
            const payload = yield jwtService.validate(data.token, configuration_1.TOKEN_SECRET);
            return payload;
        });
    }
}
exports.SpaceUsecase = SpaceUsecase;
