import { Stripe } from 'stripe';
import { PaymentLinkService } from './interface.payment.link.service';
import { User } from '../../../domain/entities/user';
import { COMPANY_DOMAIN } from '../../configuration';

export class StripePaymentLinkService implements PaymentLinkService {
    private stripe: Stripe;

    constructor(stripe: Stripe) {
        this.stripe = stripe;
    }

    async generateLink(priceId: string, customerId: string, spaceId?: string): Promise<string> {
        try {
            const params: Stripe.Checkout.SessionCreateParams = {
                mode: 'subscription',
                line_items: [
                    {
                        price: priceId,
                        quantity: 1
                    }
                ],
                customer: customerId,
                success_url: spaceId ? `${COMPANY_DOMAIN}/album/${spaceId}/setup?p=1&session_id={CHECKOUT_SESSION_ID}` : `${COMPANY_DOMAIN}/albums`,
                cancel_url: spaceId ? `${COMPANY_DOMAIN}/album/${spaceId}/setup` : `${COMPANY_DOMAIN}/pricing`
            }
            const session = await this.stripe.checkout.sessions.create(params);
    
            return session.url!;
        } catch (error) {
            console.error('Error generating checkout session:', error);
            throw new Error('Failed to generate checkout session');
        }
    } 
    
}
