import Stripe from "stripe";
import { PaymentCustomerService } from "../../application/services/payment/interface.payment.customer.service";
import { StripePaymentCustomer } from "../../application/services/payment/stripe.payment.customer.service";
import { USER_CONFIRMED, USER_SUBSCRIBED_TO_PLAN } from "../../domain/constants/event.names";
import { User } from "../../domain/entities/user";
import { eventBus } from "../../infrastructure/event/event.bus";
import { UserMongooseRepository } from "../../infrastructure/mongoose/repositories/user.mongoose.repository";
import { COMPANY_DOMAIN, EMAIL_NO_REPLY_PASS, EMAIL_NO_REPLY_SERVICE, EMAIL_NO_REPLY_USER, MONGO_URI, STRIPE_KEY } from "../../application/configuration";
import { Database } from "../../application/configuration/mongodb";
import { SubscriptionPlan } from "../../domain/entities/subscription.plan";
import { SubscriptionSuccessEmailContent } from "../../domain/types/email";
import { ALBUMS_PATH, SUPPORT_LINK_PATH } from "../../domain/constants/client.routes";
import { SubscriptionSuccessEmail } from "../../domain/entities/subscription.success.email";
import { Templates } from "../../domain/constants/templates";
import { SendEmail } from "../../application/services/send-email/nodemailer.email.service";

eventBus.on<{ user: User }>(USER_CONFIRMED, async ({ user } : { user: User }) => {

    try { 
        if(user.stripeId) return;
        await Database.connect(MONGO_URI!); // Connect to MongoDB
        const connection = Database.getConnection();
        const stripe = new Stripe(STRIPE_KEY!, { apiVersion: '2025-02-24.acacia' })
        const paymentCustomerService: PaymentCustomerService = new StripePaymentCustomer(stripe);
        const customerId = await paymentCustomerService.create(user.firstName + ' ' + user.lastName, user.email, { user_id: user.id })
        const userRepository = new UserMongooseRepository(connection)
        const found = await userRepository.findById(user.id!);
        
        if(!found) return;

        found.stripeId = customerId;

        await userRepository.save(found);

    } catch(err) {

    }

});

eventBus.on<{ user: User, plan: SubscriptionPlan }>(USER_SUBSCRIBED_TO_PLAN, async ({ user, plan } : { user: User, plan: SubscriptionPlan }) => {
    try { 
        
        const content : SubscriptionSuccessEmailContent = {
            companySupportLink: `${COMPANY_DOMAIN}${SUPPORT_LINK_PATH}`,
            features: [
                `Create up to ${plan.spaces} albums`,
                `Collaborate with ${plan.users} other users`,
                ...plan.features.map((feature) => {
                    return feature ? feature.name : undefined
                }).filter((i) => i !== undefined)
            ],
            subscriptionPlan: plan.name,
            name: user.firstName,
            albumLink: `${COMPANY_DOMAIN}${ALBUMS_PATH}`,
        }


        const email : SubscriptionSuccessEmail = {
            template: Templates.SUBSCRIPTION_SUCCESSFUL,
            to: user.email,
            from: EMAIL_NO_REPLY_USER!,
            content,
            subject: `Subscription Successful <${EMAIL_NO_REPLY_USER}>`,
            id: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await new SendEmail(
            EMAIL_NO_REPLY_SERVICE!,
            EMAIL_NO_REPLY_USER!,
            EMAIL_NO_REPLY_PASS!
        ).send(email);
    } catch(err) {}
});