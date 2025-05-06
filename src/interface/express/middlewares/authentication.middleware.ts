import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../../../application/exceptions/unauthorized.exception";
import { TokenService } from "../../../application/services/token/interface.token.service";
import { extractBearerToken } from "../../../utils/bearer.token.util";

const authentication = (secret: string, jwtService: TokenService<{ id: string }>, passive = false) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = extractBearerToken(req);

        if (!token) {
            if (passive) return next();
            return next(new UnauthorizedException("No token provided"));
        }

        const payload = await jwtService.validate(token, secret);

        if (!payload?.id) {
            if (passive) return next();
            return next(new UnauthorizedException("Invalid token"));
        }

        (req as any).user = payload; 
        next();
    } catch (error) {
        return next(new UnauthorizedException("Token validation failed"));
    }
};

export default authentication;
