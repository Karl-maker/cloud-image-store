import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "../../../application/exceptions/forbidden.exception";

const authorization = <T>(check: (
    req: Request,
    payload: T
) => Promise<boolean>) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = (req as any).user;
        if(!await check(req, user)) throw new ForbiddenException("Access denied");
        next();
    } catch (error) {
        return next(new ForbiddenException("Access denied"));
    }
};

export default authorization;