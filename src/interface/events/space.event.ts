import Stripe from "stripe";
import { COMPANY_DOMAIN, EMAIL_NO_REPLY_PASS, EMAIL_NO_REPLY_SERVICE, EMAIL_NO_REPLY_USER, MONGO_URI, STRIPE_KEY } from "../../application/configuration";
import { StripeSubscriptionService } from "../../application/services/payment/stripe.subscription.service";
import { SPACE_DELETED, SPACE_SUBSCRIBED_TO_PLAN } from "../../domain/constants/event.names";
import { Space } from "../../domain/entities/space";
import { eventBus } from "../../infrastructure/event/event.bus";
import { SubscriptionPlan } from "../../domain/entities/subscription.plan";
import { SubscriptionSuccessEmailContent } from "../../domain/types/email";
import { ALBUM_PATH, SUPPORT_LINK_PATH } from "../../domain/constants/client.routes";
import { UserUsecase } from "../../domain/usecases/user.usecase";
import { UserMongooseRepository } from "../../infrastructure/mongoose/repositories/user.mongoose.repository";
import { Database } from "../../application/configuration/mongodb";
import { SubscriptionSuccessEmail } from "../../domain/entities/subscription.success.email";
import { Templates } from "../../domain/constants/templates";
import { SendEmail } from "../../application/services/send-email/nodemailer.email.service";

eventBus.on<{ space: Space }>(SPACE_DELETED, async ({ space } : { space: Space }) => {
    try { 
        if(!space.stripeSubscriptionId) return;
        const stripeSubscriptionService = new StripeSubscriptionService(new Stripe(STRIPE_KEY!, { apiVersion: '2025-02-24.acacia' }))
        stripeSubscriptionService.cancelSubscription(space.stripeSubscriptionId);
    } catch(err) {}
});

eventBus.on<{ space: Space, plan: SubscriptionPlan }>(SPACE_SUBSCRIBED_TO_PLAN, async ({ space, plan } : { space: Space, plan: SubscriptionPlan }) => {
    try { 
        const userUsecase = new UserUsecase(new UserMongooseRepository(await Database.connect(MONGO_URI!)))
        const user = await userUsecase.findById(space.createdByUserId);

        if(user instanceof Error) return;
        
        const content : SubscriptionSuccessEmailContent = {
            companySupportLink: `${COMPANY_DOMAIN}${SUPPORT_LINK_PATH}`,
            albumLink: `${COMPANY_DOMAIN}${ALBUM_PATH}/${space.id}`,
            features: [
                `Collaborate with ${plan.users} other users`,
                ...plan.features.map((feature) => {
                    return feature ? feature.name : undefined
                }).filter((i) => i !== undefined)
            ],
            albumName: space.name,
            subscriptionPlan: plan.name,
            name: user.firstName
        }


        const email : SubscriptionSuccessEmail = {
            template: Templates.SUBSCRIPTION_SUCCESSFUL,
            to: user.email,
            from: EMAIL_NO_REPLY_USER!,
            content,
            subject: `Payment Successful <${EMAIL_NO_REPLY_USER}>`,
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