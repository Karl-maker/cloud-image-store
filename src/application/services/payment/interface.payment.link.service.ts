export interface PaymentLinkService {
    generateLink: (priceId: string, customerId: string, spaceId?: string) => Promise<string>;
}