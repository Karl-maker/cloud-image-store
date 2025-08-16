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
            // First, retrieve the price to check if it's recurring or one-time
            const price = await this.stripe.prices.retrieve(priceId);
            
            // Determine the mode based on whether the price has recurring configuration
            const mode: 'subscription' | 'payment' = price.recurring ? 'subscription' : 'payment';
            
            const params: Stripe.Checkout.SessionCreateParams = {
                mode: mode,
                line_items: [
                    {
                        price: priceId,
                        quantity: 1
                    }
                ],
                customer: customerId,
                allow_promotion_codes: true,
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
