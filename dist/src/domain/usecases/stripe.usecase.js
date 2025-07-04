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
exports.StripeUsecase = void 0;
const stripe_subscription_service_1 = require("../../application/services/payment/stripe.subscription.service");
const stripe_payment_link_service_1 = require("../../application/services/payment/stripe.payment.link.service");
const stripe_subscription_plan_service_1 = require("../../application/services/payment/stripe.subscription.plan.service");
const stripe_payment_customer_service_1 = require("../../application/services/payment/stripe.payment.customer.service");
const event_names_1 = require("../constants/event.names");
const not_found_1 = require("../../application/exceptions/not.found");
const stripe_billing_portal_service_1 = require("../../application/services/payment/stripe.billing.portal.service");
const forbidden_exception_1 = require("../../application/exceptions/forbidden.exception");
const templates_1 = require("../constants/templates");
const nodemailer_email_service_1 = require("../../application/services/send-email/nodemailer.email.service");
const configuration_1 = require("../../application/configuration");
const client_routes_1 = require("../constants/client.routes");
class StripeUsecase {
    constructor(stripe, spaceUsecase, userUsecase) {
        this.stripe = stripe;
        this.spaceUsecase = spaceUsecase;
        this.userUsecase = userUsecase;
        this.subscriptionService = new stripe_subscription_service_1.StripeSubscriptionService(stripe);
        this.paymentLinkService = new stripe_payment_link_service_1.StripePaymentLinkService(stripe);
        this.subscriptionPlanService = new stripe_subscription_plan_service_1.StripeSubscriptionPlanService(stripe);
        this.paymentCustomerService = new stripe_payment_customer_service_1.StripePaymentCustomer(stripe);
        this.billingPortalService = new stripe_billing_portal_service_1.StripeBillingPortalService(stripe);
    }
    webhook(event, eventBus) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            if (event.type === 'customer.subscription.created') {
                const customerSubscription = event.data.object;
                const subscription = yield this.subscriptionService.findById(customerSubscription.id);
                if (!subscription)
                    throw new Error('no subscription found');
                const plan = yield this.subscriptionPlanService.findById(subscription.planId);
                if (!plan)
                    throw new Error('no plan found');
                const result = yield this.userUsecase.subscribedToPlan(customerSubscription.customer, subscription, plan);
                if (result instanceof Error || result instanceof not_found_1.NotFoundException)
                    throw result;
                eventBus.emit(event_names_1.USER_SUBSCRIBED_TO_PLAN, { plan, user: result });
            }
            else if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object;
                // Check if this payment intent is NOT associated with a subscription
                if (!paymentIntent.invoice) {
                    // This is a non-subscription charge - get product data
                    let productId;
                    let priceId;
                    // Try to get product info from metadata first
                    productId = (_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.product_id;
                    priceId = (_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.price_id;
                    // If not in metadata, try to get from the session
                    if (!productId && ((_c = paymentIntent.metadata) === null || _c === void 0 ? void 0 : _c.session_id)) {
                        try {
                            const session = yield this.stripe.checkout.sessions.retrieve(paymentIntent.metadata.session_id, { expand: ['line_items.data.price.product'] });
                            if ((_g = (_f = (_e = (_d = session.line_items) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.price) === null || _g === void 0 ? void 0 : _g.product) {
                                productId = session.line_items.data[0].price.product.id;
                                priceId = session.line_items.data[0].price.id;
                            }
                        }
                        catch (sessionError) {
                            console.log('Could not retrieve session for payment intent:', paymentIntent.id);
                        }
                    }
                    console.log('Non-subscription charge detected:', {
                        paymentIntentId: paymentIntent.id,
                        customerId: paymentIntent.customer,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                        status: paymentIntent.status,
                        created: new Date(paymentIntent.created * 1000),
                        metadata: paymentIntent.metadata,
                        description: paymentIntent.description,
                        productId: productId,
                        priceId: priceId
                    });
                    const product = yield this.subscriptionPlanService.findById(productId);
                    if (!product)
                        throw new Error('no product found');
                    const user = yield this.userUsecase.findById(paymentIntent.customer);
                    if (!user)
                        throw new not_found_1.NotFoundException('no user found');
                    if (user instanceof Error)
                        throw user;
                    const result = yield this.userUsecase.receiveProduct(product, user);
                    if (result instanceof Error)
                        throw result;
                }
                // If paymentIntent.invoice exists, it's a subscription payment - we don't need to log it here
                // Subscription payments are handled by the subscription events
            }
            else if (event.type === 'customer.subscription.deleted') {
                const subscription = event.data.object;
                const result = yield this.userUsecase.subscriptionEnd(subscription.customer);
                if (result instanceof Error || result instanceof not_found_1.NotFoundException)
                    throw result;
            }
            else if (event.type === 'customer.subscription.paused') {
                const subscription = event.data.object;
                const result = yield this.userUsecase.subscriptionPaused(subscription.customer);
                if (result instanceof Error || result instanceof not_found_1.NotFoundException)
                    throw result;
            }
            else if (event.type === 'customer.subscription.resumed') {
                const subscription = event.data.object;
                const result = yield this.userUsecase.subscriptionResumed(subscription.customer);
                if (result instanceof Error || result instanceof not_found_1.NotFoundException)
                    throw result;
            }
            else if (event.type === 'customer.subscription.updated') {
                const subscription = event.data.object;
                const previousAttributes = event.data.previous_attributes;
                // Check if subscription was set to cancel at period end
                if ((previousAttributes === null || previousAttributes === void 0 ? void 0 : previousAttributes.cancel_at_period_end) === false && subscription.cancel_at_period_end === true) {
                    console.log('Subscription set to cancel at period end:', subscription.id);
                    // Don't call subscriptionEnd yet - wait for the period to actually end
                }
                // Check if subscription naturally ended (current_period_end is in the past and status is not active)
                const now = Math.floor(Date.now() / 1000);
                if (subscription.current_period_end < now && subscription.status !== 'active') {
                    console.log('Subscription naturally ended:', subscription.id);
                    const result = yield this.userUsecase.subscriptionEnd(subscription.customer);
                    if (result instanceof Error || result instanceof not_found_1.NotFoundException)
                        throw result;
                    return; // Exit early since subscription ended
                }
                // Check for plan updates (existing logic)
                const updatedPlan = previousAttributes === null || previousAttributes === void 0 ? void 0 : previousAttributes.plan;
                if (!updatedPlan)
                    return; // plan didnt update
                if (!updatedPlan.id)
                    return; // plan didnt update
                const planId = subscription.items.data[0].plan.product;
                const plan = yield this.subscriptionPlanService.findById(planId);
                if (!plan)
                    throw new Error('no plan found');
                const subscriptionEntity = yield this.subscriptionService.findById(subscription.id);
                if (subscriptionEntity === null)
                    throw new not_found_1.NotFoundException('subscription not found');
                const newUser = yield this.userUsecase.subscribedToPlan(subscription.customer, subscriptionEntity, plan);
                if (newUser instanceof Error || newUser instanceof not_found_1.NotFoundException)
                    throw newUser;
                eventBus.emit(event_names_1.USER_SUBSCRIBED_TO_PLAN, { plan, user: newUser });
            }
            else if (event.type === 'invoice.payment_failed') {
                const invoice = event.data.object;
                const customerId = invoice.customer;
                try {
                    // Generate customer portal link
                    const session = yield this.stripe.billingPortal.sessions.create({
                        customer: customerId,
                        return_url: `${configuration_1.COMPANY_DOMAIN}`,
                    });
                    const user = yield this.userUsecase.findById(customerId);
                    if (!user)
                        throw new not_found_1.NotFoundException('User not found');
                    if (user instanceof Error)
                        throw user;
                    // Send payment failure email
                    yield this.sendPaymentFailureEmail(user, session.url, invoice);
                    console.log('Payment failure handled:', {
                        customerId,
                        invoiceId: invoice.id,
                        amount: invoice.amount_due,
                        nextRetry: invoice.next_payment_attempt,
                    });
                }
                catch (error) {
                    console.error('Error handling payment failure:', error);
                    // Don't throw - let Stripe handle the retry logic
                }
            }
        });
    }
    createPaymentLink(priceId, userId, spaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userUsecase.findById(userId);
            if (!user || user instanceof Error)
                throw new not_found_1.NotFoundException('no user found');
            if (user.subscriptionStripeId)
                throw new forbidden_exception_1.ForbiddenException('already has subscription');
            const customerId = user.stripeId;
            if (!customerId)
                throw new not_found_1.NotFoundException('no customer stripe id found');
            return this.paymentLinkService.generateLink(priceId, customerId, spaceId);
        });
    }
    billingPortalLink(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.billingPortalService.generateLink(customerId);
        });
    }
    createSubscriptionPlan(plan) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.subscriptionPlanService.create(plan);
        });
    }
    cancelSubscriptionRenewal(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.subscriptionService.cancelRenewal(subscriptionId);
        });
    }
    cancelSubscriptionImmediately(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.subscriptionService.cancelSubscription(subscriptionId);
        });
    }
    upgradeSubscription(subscriptionId, newPlanId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.subscriptionService.upgradeSubscription(subscriptionId, newPlanId);
        });
    }
    downgradeSubscription(subscriptionId, newPlanId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.subscriptionService.downgradeSubscription(subscriptionId, newPlanId);
        });
    }
    pauseSubscription(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.subscriptionService.pauseSubscription(subscriptionId);
        });
    }
    resumeSubscription(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.subscriptionService.resumeSubscription(subscriptionId);
        });
    }
    findAllSubscriptionPlans() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.subscriptionPlanService.findMany();
        });
    }
    createPaymentCustomer(name, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentCustomerService.create(name, email);
        });
    }
    sendPaymentFailureEmail(user, paymentUpdateUrl, invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const nextRetryDate = invoice.next_payment_attempt
                    ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString()
                    : 'within 24 hours';
                const content = {
                    name: user.firstName,
                    paymentUpdateUrl: paymentUpdateUrl,
                    companySupportLink: `${configuration_1.COMPANY_DOMAIN}${client_routes_1.SUPPORT_LINK_PATH}`,
                    expirationTime: '24 hours',
                    nextRetryDate: nextRetryDate,
                };
                const email = {
                    template: templates_1.Templates.PAYMENT_FAILURE,
                    to: user.email,
                    from: configuration_1.EMAIL_NO_REPLY_USER,
                    content,
                    subject: 'Payment Failed - Action Required (Link expires in 24 hours)',
                    id: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                yield new nodemailer_email_service_1.SendEmail(configuration_1.EMAIL_NO_REPLY_SERVICE, configuration_1.EMAIL_NO_REPLY_USER, configuration_1.EMAIL_NO_REPLY_PASS).send(email);
            }
            catch (error) {
                console.error('Error sending payment failure email:', error);
            }
        });
    }
}
exports.StripeUsecase = StripeUsecase;
