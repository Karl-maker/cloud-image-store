import { Stripe } from 'stripe';
import { BillingPortalService } from './interface.billing.portal.service';
import { COMPANY_DOMAIN } from '../../configuration';

export class StripeBillingPortalService implements BillingPortalService {
    private stripe: Stripe;

    constructor(stripe: Stripe) {
        this.stripe = stripe;
    }

    async generateLink (customerId: string) : Promise<string> {
        try {
            // Create a session for the customer to access the billing portal
            const session = await this.stripe.billingPortal.sessions.create({
              customer: customerId,
              return_url: COMPANY_DOMAIN, // URL to return the user to after they leave the portal
            });
        
            // The session URL that the customer can use to access the billing portal
            return session.url;
        } catch (error) {
            console.error('Error creating billing portal session:', error);
            throw error;
        }
    };
}