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
const configuration_1 = require("../application/configuration");
const jwt_token_service_1 = require("../application/services/token/jwt.token.service");
const api_key_1 = require("../domain/enums/api.key");
const jwt_time_util_1 = require("../utils/jwt.time.util");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jwt = new jwt_token_service_1.JwtTokenService();
        const secret = configuration_1.API_KEY_SECRET;
        const payload = { type: api_key_1.API_KEY_TYPE.website };
        const config = {
            issuer: "admin-script",
            audience: 'cloud-photo-share',
            exp: (0, jwt_time_util_1.dateToJwtExp)(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
        };
        const token = yield jwt.generate(payload, secret, config);
        console.info("API_KEY: ", token);
        process.exit(0);
    }
    catch (error) {
        console.error("Error running script:", error);
        process.exit(1); // Exit with failure
    }
});
// Execute the script
run();
