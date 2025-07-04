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
exports.StripePaymentMethodService = void 0;
class StripePaymentMethodService {
    /**
     * Constructor to initialize the Stripe instance.
     * @param stripe - An instance of the Stripe SDK.
     */
    constructor(stripe) {
        this.stripe = stripe;
    }
    /**
     * Adds a new payment method for a customer.
     * @param customerId - The ID of the customer.
     * @param paymentMethodDetails - The details of the payment method to add.
     * @returns The added payment method.
     */
    addPaymentMethod(customerId, paymentMethodDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Attach the payment method to the customer
                const paymentMethod = yield this.stripe.paymentMethods.attach(paymentMethodDetails.id, {
                    customer: customerId,
                });
                // Optionally, set this payment method as the default for the customer
                if (paymentMethodDetails.isDefault) {
                    yield this.stripe.customers.update(customerId, {
                        invoice_settings: {
                            default_payment_method: paymentMethod.id,
                        },
                    });
                }
                return this.mapStripePaymentMethodToPaymentMethod(paymentMethod, customerId);
            }
            catch (error) {
                throw new Error(`Failed to add payment method: ${(_a = error.message) !== null && _a !== void 0 ? _a : error}`);
            }
        });
    }
    /**
     * Deletes a payment method.
     * @param paymentMethodId - The ID of the payment method to delete.
     * @returns The result of the deletion operation.
     */
    deletePaymentMethod(paymentMethodId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                yield this.stripe.paymentMethods.detach(paymentMethodId);
                return {
                    id: paymentMethodId,
                    success: true,
                    message: 'Payment method successfully deleted.',
                };
            }
            catch (error) {
                return {
                    id: paymentMethodId,
                    success: false,
                    message: `Failed to delete payment method: ${(_a = error.message) !== null && _a !== void 0 ? _a : error}`,
                };
            }
        });
    }
    /**
     * Updates a payment method.
     * @param paymentMethodId - The ID of the payment method to update.
     * @param updates - The updates to apply to the payment method.
     * @returns The updated payment method.
     */
    updatePaymentMethod(paymentMethodId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const expMonth = updates.expirationDate ? updates.expirationDate.getMonth() + 1 : undefined; // Months are 0-indexed in JavaScript, so adding 1
                const expYear = updates.expirationDate ? updates.expirationDate.getFullYear() : undefined; // Gets the full year
                const stripeUpdateParams = {
                    billing_details: {
                        name: updates.name,
                        email: updates.email,
                        phone: updates.phone,
                        address: updates.address
                    },
                    card: {
                        exp_month: expMonth,
                        exp_year: expYear,
                    }
                };
                const paymentMethod = yield this.stripe.paymentMethods.update(paymentMethodId, stripeUpdateParams);
                return this.mapStripePaymentMethodToPaymentMethod(paymentMethod);
            }
            catch (error) {
                throw new Error(`Failed to update payment method: ${(_a = error.message) !== null && _a !== void 0 ? _a : error}`);
            }
        });
    }
    /**
     * Retrieves payment methods associated with a specific customer.
     * @param customerId - The ID of the customer.
     * @returns A list of payment methods.
     */
    getPaymentMethodsByCustomer(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const paymentMethods = yield this.stripe.paymentMethods.list({
                    customer: customerId,
                    type: 'card',
                });
                return paymentMethods.data.map(pm => this.mapStripePaymentMethodToPaymentMethod(pm, customerId));
            }
            catch (error) {
                throw new Error(`Failed to retrieve payment methods: ${(_a = error.message) !== null && _a !== void 0 ? _a : error}`);
            }
        });
    }
    /**
     * Maps a Stripe PaymentMethod object to our PaymentMethod interface.
     * @param stripePaymentMethod - The Stripe PaymentMethod object.
     * @param customerId - The ID of the customer.
     * @returns A PaymentMethod object.
     */
    mapStripePaymentMethodToPaymentMethod(stripePaymentMethod, customerId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return {
            id: stripePaymentMethod.id,
            customerId: customerId || ((_a = stripePaymentMethod.customer) === null || _a === void 0 ? void 0 : _a.toString()) || '',
            type: stripePaymentMethod.type,
            isDefault: typeof stripePaymentMethod.customer !== 'string'
                ? ((_c = (_b = stripePaymentMethod.customer) === null || _b === void 0 ? void 0 : _b.invoice_settings) === null || _c === void 0 ? void 0 : _c.default_payment_method) === stripePaymentMethod.id
                : false,
            lastFourDigits: (_d = stripePaymentMethod.card) === null || _d === void 0 ? void 0 : _d.last4,
            expirationDate: ((_e = stripePaymentMethod.card) === null || _e === void 0 ? void 0 : _e.exp_month) && ((_f = stripePaymentMethod.card) === null || _f === void 0 ? void 0 : _f.exp_year)
                ? new Date(`${stripePaymentMethod.card.exp_year}-${String(stripePaymentMethod.card.exp_month).padStart(2, '0')}-01`)
                : undefined,
            brand: (_g = stripePaymentMethod.card) === null || _g === void 0 ? void 0 : _g.brand,
            country: (_h = stripePaymentMethod.card) === null || _h === void 0 ? void 0 : _h.country,
            createdAt: stripePaymentMethod.created ? new Date(stripePaymentMethod.created * 1000) : new Date(), // Assuming `created` is in seconds
            updatedAt: stripePaymentMethod.created ? new Date(stripePaymentMethod.created * 1000) : new Date(), // Assuming `updated` is in seconds
        };
    }
}
exports.StripePaymentMethodService = StripePaymentMethodService;
