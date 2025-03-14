import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../../../application/exceptions/unauthorized.exception";
import { TokenService } from "../../../application/services/token/interface.token.service";

const authenticateClient = (secret: string, jwtService: TokenService<{ type: string }>) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const key = req.headers["x-api-key"];

        if (!key || typeof key !== 'string') {
            return next(new UnauthorizedException("No key provided"));
        }

        const payload = await jwtService.validate(key, secret);

        if (!payload?.type) {
            return next(new UnauthorizedException("Invalid key"));
        }
        next();
    } catch (error) {
        return next(new UnauthorizedException("Api key validation failed"));
    }
};

export default authenticateClient;
