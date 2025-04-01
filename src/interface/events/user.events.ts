import Stripe from "stripe";
import { PaymentCustomerService } from "../../application/services/payment/interface.payment.customer.service";
import { StripePaymentCustomer } from "../../application/services/payment/stripe.payment.customer.service";
import { USER_CONFIRMED } from "../../domain/constants/event.names";
import { User } from "../../domain/entities/user";
import { eventBus } from "../../infrastructure/event/event.bus";
import { UserMongooseRepository } from "../../infrastructure/mongoose/repositories/user.mongoose.repository";
import { MONGO_URI, STRIPE_KEY } from "../../application/configuration";
import { Database } from "../../application/configuration/mongodb";

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