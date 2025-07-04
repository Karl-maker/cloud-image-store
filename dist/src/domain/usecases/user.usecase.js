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
exports.UserUsecase = void 0;
const password_service_1 = require("../../application/services/password/password.service");
const usecases_1 = require("./usecases");
const jwt_token_service_1 = require("../../application/services/token/jwt.token.service");
const jwt_time_util_1 = require("../../utils/jwt.time.util");
const not_found_1 = require("../../application/exceptions/not.found");
const configuration_1 = require("../../application/configuration");
const nodemailer_email_service_1 = require("../../application/services/send-email/nodemailer.email.service");
const templates_1 = require("../constants/templates");
const x_mins_ago_util_1 = require("../../utils/x.mins.ago.util");
const validation_exception_1 = require("../../application/exceptions/validation.exception");
const client_routes_1 = require("../constants/client.routes");
const http_exception_1 = require("../../application/exceptions/http.exception");
class UserUsecase extends usecases_1.Usecases {
    constructor(repository) {
        super(repository);
    }
    mapCreateDtoToEntity(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashResults = yield password_service_1.PasswordService.hash(data.password);
            const user = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                hashPassword: hashResults.pass,
                confirmed: false,
                id: null,
                stripeId: null,
                salt: hashResults.salt,
                createdAt: new Date(),
                updatedAt: new Date(),
                maxUsers: 0,
                maxSpaces: 0,
                maxStorage: 0,
                maxAiEnhancementsPerMonth: 0
            };
            return user;
        });
    }
    mapUpdateDtoToEntity(data, item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.password) {
                if (item.lastPasswordUpdate && !(0, x_mins_ago_util_1.wasMinutesAgo)(item.lastPasswordUpdate, 15))
                    throw new validation_exception_1.ValidationException('Cannot update password right not');
                const hashResults = yield password_service_1.PasswordService.hash(data.password);
                delete data['password'];
                item.hashPassword = hashResults.pass;
                item.salt = hashResults.salt;
                item.lastPasswordUpdate = new Date();
            }
            const user = Object.assign(Object.assign({}, item), data);
            return user;
        });
    }
    sendConfirmationEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.repository.findById(data.userId);
            if (!user)
                throw new not_found_1.NotFoundException('user not found');
            const config = {
                issuer: "confirmation",
                exp: (15 * 60) + (0, jwt_time_util_1.dateToJwtExp)(new Date()),
                audience: 'cloud-photo-share'
            };
            const secret = configuration_1.CONFIRMATION_SECRET;
            const confirmationToken = yield new jwt_token_service_1.JwtTokenService().generate({ userId: user.id }, secret, config);
            const content = {
                link: `${configuration_1.COMPANY_DOMAIN}${client_routes_1.CONFIRMATION_PATH}?token=` + confirmationToken,
                name: user.firstName + " " + user.lastName,
                expiresIn: "15 minutes"
            };
            const email = {
                template: templates_1.Templates.CONFIRMATION,
                to: user.email,
                from: configuration_1.EMAIL_NO_REPLY_USER,
                content,
                subject: `Confirmation <${configuration_1.EMAIL_NO_REPLY_USER}>`,
                id: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            yield new nodemailer_email_service_1.SendEmail(configuration_1.EMAIL_NO_REPLY_SERVICE, configuration_1.EMAIL_NO_REPLY_USER, configuration_1.EMAIL_NO_REPLY_PASS).send(email);
        });
    }
    checkConfirmationToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const secret = configuration_1.CONFIRMATION_SECRET;
            const payload = yield new jwt_token_service_1.JwtTokenService().validate(data.token, secret);
            const user = yield this.repository.findById(payload.userId);
            if (!user)
                throw new not_found_1.NotFoundException('no user found');
            user.confirmed = true;
            return yield this.repository.save(user);
        });
    }
    recover(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = (yield this.repository.findMany({
                filters: {
                    email: {
                        exact: data.email
                    }
                }
            })).data[0];
            if (!user)
                throw new not_found_1.NotFoundException('user not found');
            if (user.lastPasswordUpdate && !(0, x_mins_ago_util_1.wasMinutesAgo)(user.lastPasswordUpdate, 15))
                throw new validation_exception_1.ValidationException('cannot recover right now');
            const config = {
                issuer: "recovery",
                exp: (15 * 60) + (0, jwt_time_util_1.dateToJwtExp)(new Date()),
                audience: 'cloud-photo-share'
            };
            const secret = configuration_1.TOKEN_SECRET;
            const token = yield new jwt_token_service_1.JwtTokenService().generate({ id: user.id }, secret, config);
            const content = {
                link: `${configuration_1.COMPANY_DOMAIN}${client_routes_1.RECOVERY_PATH}?token=` + token,
                name: user.firstName + " " + user.lastName,
                expiresIn: "15 minutes"
            };
            const email = {
                template: templates_1.Templates.RECOVERY,
                to: user.email,
                from: configuration_1.EMAIL_NO_REPLY_USER,
                content,
                subject: `Recover Password <${configuration_1.EMAIL_NO_REPLY_USER}>`,
                id: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            yield new nodemailer_email_service_1.SendEmail(configuration_1.EMAIL_NO_REPLY_SERVICE, configuration_1.EMAIL_NO_REPLY_USER, configuration_1.EMAIL_NO_REPLY_PASS).send(email);
        });
    }
    login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = (yield this.repository.findMany({
                filters: {
                    email: {
                        exact: data.email
                    }
                }
            })).data[0];
            if (!user)
                throw new not_found_1.NotFoundException('user not found');
            if (!(yield password_service_1.PasswordService.compare(data.password, user.hashPassword, user.salt)))
                throw new validation_exception_1.ValidationException('invalid email or password');
            const config = {
                issuer: "auth",
                exp: (60 * 60 * 24 * 30) + (0, jwt_time_util_1.dateToJwtExp)(new Date()),
                audience: 'cloud-photo-share'
            };
            const secret = configuration_1.TOKEN_SECRET;
            const token = yield new jwt_token_service_1.JwtTokenService().generate({ id: user.id }, secret, config);
            return {
                accessToken: token
            };
        });
    }
    register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield this.mapCreateDtoToEntity(data);
            const saved = yield this.repository.save(entity);
            if (!saved)
                throw new http_exception_1.HttpException('Issue Registering', 'Issue occured', 500);
            const loginResponse = yield this.login({ email: data.email, password: data.password });
            yield this.sendConfirmationEmail({
                userId: saved.id
            });
            return Object.assign(Object.assign({}, loginResponse), { user: saved });
        });
    }
    subscribedToPlan(stripeCustomerId, subscription, subscriptionPlan) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const mb = subscriptionPlan.megabytes;
                const maxUsers = subscriptionPlan.users;
                const users = yield this.repository.findMany({
                    filters: {
                        stripeId: {
                            exact: stripeCustomerId
                        }
                    }
                });
                const user = users.data[0];
                if (!user)
                    return new not_found_1.NotFoundException('user not found by id');
                user.maxStorage = mb;
                user.maxUsers = maxUsers;
                user.maxSpaces = subscriptionPlan.spaces;
                user.maxAiEnhancementsPerMonth = (_a = subscriptionPlan.aiGenerationsPerMonth) !== null && _a !== void 0 ? _a : 0;
                user.deactivatedAt = undefined;
                user.subscriptionPlanExpiresAt = undefined;
                user.subscriptionPlanStripeId = (_b = subscriptionPlan.id) !== null && _b !== void 0 ? _b : undefined;
                user.subscriptionStripeId = (_c = subscription.id) !== null && _c !== void 0 ? _c : undefined;
                const saved = yield this.repository.save(user);
                return saved;
            }
            catch (err) {
                if (err instanceof Error)
                    return err;
                return new Error(`${err}`);
            }
        });
    }
    receiveProduct(plan, user) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const mb = plan.megabytes;
                const maxUsers = plan.users;
                const deactivationDate = new Date();
                deactivationDate.setDate(deactivationDate.getDate() + 90);
                user.maxStorage = mb;
                user.maxUsers = maxUsers;
                user.maxSpaces = plan.spaces;
                user.maxAiEnhancementsPerMonth = (_a = plan.aiGenerationsPerMonth) !== null && _a !== void 0 ? _a : 0;
                user.subscriptionPlanExpiresAt = deactivationDate;
                user.subscriptionPlanStripeId = (_b = plan.id) !== null && _b !== void 0 ? _b : undefined;
                user.subscriptionStripeId = undefined;
                const saved = yield this.repository.save(user);
                return saved;
            }
            catch (err) {
                if (err instanceof Error)
                    return err;
                return new Error(`${err}`);
            }
        });
    }
    subscriptionEnd(stripeCustomerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.repository.findMany({
                    filters: {
                        stripeId: {
                            exact: stripeCustomerId
                        }
                    }
                });
                const user = users.data[0];
                if (!user)
                    return new not_found_1.NotFoundException('user not found by id');
                user.subscriptionPlanExpiresAt = new Date();
                const saved = yield this.repository.save(user);
                return saved;
            }
            catch (err) {
                if (err instanceof Error)
                    return err;
                return new Error(`${err}`);
            }
        });
    }
    subscriptionPaused(stripeCustomerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.repository.findMany({
                    filters: {
                        stripeId: {
                            exact: stripeCustomerId
                        }
                    }
                });
                const user = users.data[0];
                if (!user)
                    return new not_found_1.NotFoundException('user not found by id');
                user.subscriptionPlanExpiresAt = new Date();
                const saved = yield this.repository.save(user);
                return saved;
            }
            catch (err) {
                if (err instanceof Error)
                    return err;
                return new Error(`${err}`);
            }
        });
    }
    subscriptionResumed(stripeCustomerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.repository.findMany({
                    filters: {
                        stripeId: {
                            exact: stripeCustomerId
                        }
                    }
                });
                const user = users.data[0];
                if (!user)
                    return new not_found_1.NotFoundException('user not found by id');
                user.subscriptionPlanExpiresAt = undefined;
                const saved = yield this.repository.save(user);
                return saved;
            }
            catch (err) {
                if (err instanceof Error)
                    return err;
                return new Error(`${err}`);
            }
        });
    }
}
exports.UserUsecase = UserUsecase;
