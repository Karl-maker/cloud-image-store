export interface PaymentLinkService {
    generateLink: (priceId: string, spaceId: string, customerId: string) => Promise<string>;
}