import { User } from "../../../domain/entities/user";

export interface PaymentLinkService {
    generateLink: (priceId: string, user: User) => Promise<string>;
}