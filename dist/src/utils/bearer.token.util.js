"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractBearerToken = void 0;
/**
 * Extracts the Bearer token from the Authorization header.
 * @param req - Express request object
 * @returns The token as a string if found, otherwise null.
 */
const extractBearerToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.split(" ")[1];
};
exports.extractBearerToken = extractBearerToken;
