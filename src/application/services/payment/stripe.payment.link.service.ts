import { Stripe } from 'stripe';
import { PaymentLinkService } from './interface.payment.link.service';
import { User } from '../../../domain/entities/user';
import { COMPANY_DOMAIN } from '../../configuration';

export class StripePaymentLinkService implements PaymentLinkService {
    private stripe: Stripe;

    constructor(stripe: Stripe) {
        this.stripe = stripe;
    }

    async generateLink(priceId: string, spaceId: string): Promise<string> {
        try {
            const paymentLink = await this.stripe.paymentLinks.create({
                line_items: [{
                    price: priceId,
                    quantity: 1,
                    adjustable_quantity: { enabled: false }
                }],
                subscription_data: {
                    metadata: {
                        space_id: spaceId
                    }
                },
                after_completion: {
                    type: 'redirect',
                    redirect: {
                        url: COMPANY_DOMAIN + '/album/' + spaceId + '/setup?p=1'
                    }
                },
            });
    
            return paymentLink.url;
        } catch (error) {
            console.error('Error generating payment link:', error);
            throw new Error('Failed to generate payment link');
        }
    }
    
    
}
