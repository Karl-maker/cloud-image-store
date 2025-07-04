import Stripe from "stripe";

export class MockStripeService {
    private customerData: Map<string, any> = new Map();
    private subscriptionData: Map<string, any> = new Map();
    private paymentIntentData: Map<string, any> = new Map();
    private invoiceData: Map<string, any> = new Map();

    // Mock customer methods
    customers = {
        create: async (params: any) => {
            const customer = {
                id: `cus_${Math.random().toString(36).substr(2, 9)}`,
                email: params.email,
                name: params.name,
                metadata: params.metadata || {},
                created: Math.floor(Date.now() / 1000),
            };
            this.customerData.set(customer.id, customer);
            return customer;
        },
        retrieve: async (id: string) => {
            return this.customerData.get(id) || null;
        }
    };

    // Mock subscription methods
    subscriptions = {
        create: async (params: any) => {
            const subscription = {
                id: `sub_${Math.random().toString(36).substr(2, 9)}`,
                customer: params.customer,
                status: 'active',
                current_period_start: Math.floor(Date.now() / 1000),
                current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
                items: {
                    data: [{
                        id: `si_${Math.random().toString(36).substr(2, 9)}`,
                        price: {
                            id: params.items[0].price,
                            product: `prod_${Math.random().toString(36).substr(2, 9)}`
                        }
                    }]
                },
                created: Math.floor(Date.now() / 1000),
            };
            this.subscriptionData.set(subscription.id, subscription);
            return subscription;
        },
        retrieve: async (id: string) => {
            return this.subscriptionData.get(id) || null;
        },
        cancel: async (id: string) => {
            const subscription = this.subscriptionData.get(id);
            if (subscription) {
                subscription.status = 'canceled';
                subscription.canceled_at = Math.floor(Date.now() / 1000);
            }
            return subscription;
        }
    };

    // Mock payment intent methods
    paymentIntents = {
        create: async (params: any) => {
            const paymentIntent = {
                id: `pi_${Math.random().toString(36).substr(2, 9)}`,
                amount: params.amount,
                currency: params.currency,
                status: 'succeeded',
                customer: params.customer,
                created: Math.floor(Date.now() / 1000),
            };
            this.paymentIntentData.set(paymentIntent.id, paymentIntent);
            return paymentIntent;
        },
        retrieve: async (id: string) => {
            return this.paymentIntentData.get(id) || null;
        }
    };

    // Mock invoice methods
    invoices = {
        retrieve: async (id: string) => {
            return this.invoiceData.get(id) || null;
        }
    };

    // Mock billing portal methods
    billingPortal = {
        sessions: {
            create: async (params: any) => {
                return {
                    id: `bps_${Math.random().toString(36).substr(2, 9)}`,
                    url: `https://mock-stripe.com/billing/${params.customer}`,
                    created: Math.floor(Date.now() / 1000),
                };
            }
        }
    };

    // Test helper methods
    clearAllData(): void {
        this.customerData.clear();
        this.subscriptionData.clear();
        this.paymentIntentData.clear();
        this.invoiceData.clear();
    }

    getCustomerCount(): number {
        return this.customerData.size;
    }

    getSubscriptionCount(): number {
        return this.subscriptionData.size;
    }
} 