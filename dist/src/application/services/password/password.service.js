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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const configuration_1 = require("../../configuration");
class PasswordService {
    static hash(pass) {
        return __awaiter(this, void 0, void 0, function* () {
            const saltRounds = 10;
            const salt = yield bcryptjs_1.default.genSalt(saltRounds);
            const pepper = configuration_1.PEPPER;
            const hashedPassword = yield bcryptjs_1.default.hash(pass + pepper, salt);
            return {
                pass: hashedPassword,
                salt
            };
        });
    }
    /**
     * Compares a plaintext password with the hashed password.
     * @param pass The plaintext password to compare.
     * @param hashedPassword The hashed password to compare against.
     * @param salt The salt that was used to hash the password.
     * @returns A boolean indicating whether the password matches the hashed password.
     */
    static compare(pass, hashedPassword, salt) {
        return __awaiter(this, void 0, void 0, function* () {
            const pepper = configuration_1.PEPPER;
            const hashedInputPassword = yield bcryptjs_1.default.hash(pass + pepper, salt);
            return hashedPassword === hashedInputPassword;
        });
    }
}
exports.PasswordService = PasswordService;
