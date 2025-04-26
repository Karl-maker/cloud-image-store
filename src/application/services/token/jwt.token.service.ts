import jwt, { SignOptions, VerifyErrors } from "jsonwebtoken";
import { TokenServiceConfiguration } from "../../../domain/types/token";
import { TokenService } from "./interface.token.service";

export class JwtTokenService<Payload extends object> implements TokenService<Payload> {
    constructor() {}

    async generate(payload: Payload, secret: string, config: TokenServiceConfiguration): Promise<string> {
        const options : SignOptions =  {
            issuer: config.issuer,
            expiresIn: config.exp, // Ensure valid type
            //notBefore: config.nbf ?? undefined,
            audience: config.audience,
            algorithm: config.algorithm ?? "HS256",
        }

        return jwt.sign(
            payload,
            secret,
            options
        );
    }

    async validate(token: string, secret: string): Promise<Payload> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err: VerifyErrors | null, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded as Payload);
                }
            });
        });
    }
}
