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
exports.StripeController = void 0;
const event_bus_1 = require("../../../infrastructure/event/event.bus");
const api_routes_1 = require("../../../domain/constants/api.routes");
class StripeController {
    constructor(usecase, stripe, endpointSecret) {
        this.usecase = usecase;
        this.stripe = stripe;
        this.endpointSecret = endpointSecret;
    }
    getPaymentLink(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { priceId, spaceId } = req.body;
                const link = yield this.usecase.createPaymentLink(priceId, userId, spaceId);
                res.status(201).json({ link });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getBillingPortalLink(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customer_id = req.params[api_routes_1.CUSTOMER_PARAM];
                const link = yield this.usecase.billingPortalLink(customer_id);
                res.status(201).json({ link });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createSubscriptionPlan(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = req.body;
                const response = yield this.usecase.createSubscriptionPlan(params);
                console.log(response);
                res.status(201).end();
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    cancelRenewal(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subscriptionId } = req.body;
                yield this.usecase.cancelSubscriptionRenewal(subscriptionId);
                res.status(200).end();
            }
            catch (error) {
                next(error);
            }
        });
    }
    cancelImmediately(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subscriptionId } = req.body;
                yield this.usecase.cancelSubscriptionImmediately(subscriptionId);
                res.status(200).end();
            }
            catch (error) {
                next(error);
            }
        });
    }
    findSubscriptionPlans(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plans = yield this.usecase.findAllSubscriptionPlans();
                res.status(200).json({
                    data: plans
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    upgradeSubscription(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subscriptionId, newPriceId } = req.body;
                const subscription = yield this.usecase.upgradeSubscription(subscriptionId, newPriceId);
                res.status(200).json(subscription);
            }
            catch (error) {
                next(error);
            }
        });
    }
    downgradeSubscription(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subscriptionId, newPriceId } = req.body;
                const subscription = yield this.usecase.downgradeSubscription(subscriptionId, newPriceId);
                res.status(200).json(subscription);
            }
            catch (error) {
                next(error);
            }
        });
    }
    webhook(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sig = req.headers['stripe-signature'];
                const payload = req.body;
                const event = this.stripe.webhooks.constructEvent(payload, sig, this.endpointSecret);
                yield this.usecase.webhook(event, event_bus_1.eventBus);
                res.status(200).send('Event received');
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
}
exports.StripeController = StripeController;
