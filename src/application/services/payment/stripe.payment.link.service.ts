import { Stripe } from 'stripe';
import { PaymentLinkService } from './interface.payment.link.service';
import { User } from '../../../domain/entities/user';

export class StripePaymentLinkService implements PaymentLinkService {
    private stripe: Stripe;

    constructor(stripe: Stripe) {
        this.stripe = stripe;
    }

    async generateLink(priceId: string, user: User): Promise<string> {
        try {
            const paymentLink = await this.stripe.paymentLinks.create({
                line_items: [{ price: priceId, quantity: 1 }],
                payment_intent_data: {
                    metadata: {
                        user: user.id,
                        email: user.email
                    }
                }
            });

            return paymentLink.url;
        } catch (error) {
            console.error('Error generating payment link:', error);
            throw new Error('Failed to generate payment link');
        }
    }
}
