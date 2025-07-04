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
const stripe_1 = __importDefault(require("stripe"));
const stripe_payment_customer_service_1 = require("../../application/services/payment/stripe.payment.customer.service");
const event_names_1 = require("../../domain/constants/event.names");
const event_bus_1 = require("../../infrastructure/event/event.bus");
const user_mongoose_repository_1 = require("../../infrastructure/mongoose/repositories/user.mongoose.repository");
const configuration_1 = require("../../application/configuration");
const mongodb_1 = require("../../application/configuration/mongodb");
const client_routes_1 = require("../../domain/constants/client.routes");
const templates_1 = require("../../domain/constants/templates");
const nodemailer_email_service_1 = require("../../application/services/send-email/nodemailer.email.service");
event_bus_1.eventBus.on(event_names_1.USER_CONFIRMED, (_a) => __awaiter(void 0, [_a], void 0, function* ({ user }) {
    try {
        if (user.stripeId)
            return;
        yield mongodb_1.Database.connect(configuration_1.MONGO_URI); // Connect to MongoDB
        const connection = mongodb_1.Database.getConnection();
        const stripe = new stripe_1.default(configuration_1.STRIPE_KEY, { apiVersion: '2025-02-24.acacia' });
        const paymentCustomerService = new stripe_payment_customer_service_1.StripePaymentCustomer(stripe);
        const customerId = yield paymentCustomerService.create(user.firstName + ' ' + user.lastName, user.email, { user_id: user.id });
        const userRepository = new user_mongoose_repository_1.UserMongooseRepository(connection);
        const found = yield userRepository.findById(user.id);
        if (!found)
            return;
        found.stripeId = customerId;
        yield userRepository.save(found);
    }
    catch (err) {
    }
}));
event_bus_1.eventBus.on(event_names_1.USER_SUBSCRIBED_TO_PLAN, (_a) => __awaiter(void 0, [_a], void 0, function* ({ user, plan }) {
    try {
        const content = {
            companySupportLink: `${configuration_1.COMPANY_DOMAIN}${client_routes_1.SUPPORT_LINK_PATH}`,
            features: [
                `Create up to ${plan.spaces} albums`,
                `Collaborate with ${plan.users} other users`,
                ...plan.features.map((feature) => {
                    return feature ? feature.name : undefined;
                }).filter((i) => i !== undefined)
            ],
            subscriptionPlan: plan.name,
            name: user.firstName,
            albumLink: `${configuration_1.COMPANY_DOMAIN}${client_routes_1.ALBUMS_PATH}`,
        };
        const email = {
            template: templates_1.Templates.SUBSCRIPTION_SUCCESSFUL,
            to: user.email,
            from: configuration_1.EMAIL_NO_REPLY_USER,
            content,
            subject: `Subscription Successful <${configuration_1.EMAIL_NO_REPLY_USER}>`,
            id: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        yield new nodemailer_email_service_1.SendEmail(configuration_1.EMAIL_NO_REPLY_SERVICE, configuration_1.EMAIL_NO_REPLY_USER, configuration_1.EMAIL_NO_REPLY_PASS).send(email);
    }
    catch (err) { }
}));
