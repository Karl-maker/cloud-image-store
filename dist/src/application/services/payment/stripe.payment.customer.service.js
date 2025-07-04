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
exports.StripePaymentCustomer = void 0;
class StripePaymentCustomer {
    constructor(stripe) {
        this.stripe = stripe;
    }
    create(name, email, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield this.stripe.customers.create({
                name,
                email,
                metadata,
            });
            return customer.id;
        });
    }
    delete(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stripe.customers.del(customerId);
        });
    }
    update(customerId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stripe.customers.update(customerId, updates);
        });
    }
    findById(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customer = yield this.stripe.customers.retrieve(customerId);
                // Stripe API might return a deleted customer as an object with `deleted: true`
                if (customer.deleted) {
                    return null;
                }
                return this.mapStripeCustomer(customer);
            }
            catch (error) {
                if (error.type === 'StripeInvalidRequestError') {
                    return null; // Customer not found
                }
                throw error;
            }
        });
    }
    mapStripeCustomer(customer) {
        return {
            id: customer.id,
            name: customer.name || '',
            email: customer.email || '',
            metadata: customer.metadata,
            createdAt: new Date(customer.created * 1000),
            updatedAt: new Date(customer.created * 1000),
        };
    }
}
exports.StripePaymentCustomer = StripePaymentCustomer;
