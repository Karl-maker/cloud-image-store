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
exports.StripePaymentLinkService = void 0;
const configuration_1 = require("../../configuration");
class StripePaymentLinkService {
    constructor(stripe) {
        this.stripe = stripe;
    }
    generateLink(priceId, customerId, spaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First, retrieve the price to check if it's recurring or one-time
                const price = yield this.stripe.prices.retrieve(priceId);
                // Determine the mode based on whether the price has recurring configuration
                const mode = price.recurring ? 'subscription' : 'payment';
                const params = {
                    mode: mode,
                    line_items: [
                        {
                            price: priceId,
                            quantity: 1
                        }
                    ],
                    customer: customerId,
                    success_url: spaceId ? `${configuration_1.COMPANY_DOMAIN}/album/${spaceId}/setup?p=1&session_id={CHECKOUT_SESSION_ID}` : `${configuration_1.COMPANY_DOMAIN}/albums`,
                    cancel_url: spaceId ? `${configuration_1.COMPANY_DOMAIN}/album/${spaceId}/setup` : `${configuration_1.COMPANY_DOMAIN}/pricing`
                };
                const session = yield this.stripe.checkout.sessions.create(params);
                return session.url;
            }
            catch (error) {
                console.error('Error generating checkout session:', error);
                throw new Error('Failed to generate checkout session');
            }
        });
    }
}
exports.StripePaymentLinkService = StripePaymentLinkService;
