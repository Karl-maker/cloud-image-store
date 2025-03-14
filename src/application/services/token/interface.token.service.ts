import { TokenServiceConfiguration } from "../../../domain/types/token";

export interface TokenService<Payload> {
    validate: (token: string, secret: string) => Promise<Payload>;
    generate: (payload: Payload, secret: string, options: TokenServiceConfiguration) => Promise<string>;
}