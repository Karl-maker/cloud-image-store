import { Request } from "express";

/**
 * Extracts the Bearer token from the Authorization header.
 * @param req - Express request object
 * @returns The token as a string if found, otherwise null.
 */
export const extractBearerToken = (req: Request): string | null => {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    return authHeader.split(" ")[1];
};
