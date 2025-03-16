export interface PaymentLinkService {
    generateLink: (priceId: string, spaceId: string) => Promise<string>;
}