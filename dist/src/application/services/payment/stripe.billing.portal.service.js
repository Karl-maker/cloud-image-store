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
exports.StripeBillingPortalService = void 0;
const configuration_1 = require("../../configuration");
class StripeBillingPortalService {
    constructor(stripe) {
        this.stripe = stripe;
    }
    generateLink(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Create a session for the customer to access the billing portal
                const session = yield this.stripe.billingPortal.sessions.create({
                    customer: customerId,
                    return_url: configuration_1.COMPANY_DOMAIN, // URL to return the user to after they leave the portal
                });
                // The session URL that the customer can use to access the billing portal
                return session.url;
            }
            catch (error) {
                console.error('Error creating billing portal session:', error);
                throw error;
            }
        });
    }
    ;
}
exports.StripeBillingPortalService = StripeBillingPortalService;
