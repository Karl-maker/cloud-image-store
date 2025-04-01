import { Stripe } from 'stripe';
import { PaymentLinkService } from './interface.payment.link.service';
import { User } from '../../../domain/entities/user';
import { COMPANY_DOMAIN } from '../../configuration';

export class StripePaymentLinkService implements PaymentLinkService {
    private stripe: Stripe;

    constructor(stripe: Stripe) {
        this.stripe = stripe;
    }

    async generateLink(priceId: string, spaceId: string, customerId: string): Promise<string> {
        try {
            const session = await this.stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{
                    price: priceId,
                    quantity: 1
                }],
                customer: customerId,
                metadata: {
                    space_id: spaceId
                },
                subscription_data: {
                    metadata: {
                        space_id: spaceId
                    },
                },
                success_url: `${COMPANY_DOMAIN}/album/${spaceId}/setup?p=1&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${COMPANY_DOMAIN}/album/${spaceId}/setup`
            });
    
            return session.url!;
        } catch (error) {
            console.error('Error generating checkout session:', error);
            throw new Error('Failed to generate checkout session');
        }
    } 
    
}
