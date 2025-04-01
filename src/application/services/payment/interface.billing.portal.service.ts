export interface BillingPortalService {
    generateLink: (customerId: string) => Promise<string>;
}