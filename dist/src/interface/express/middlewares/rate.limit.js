"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = rateLimiter;
const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 60;
const ipRequestMap = new Map();
function rateLimiter(req, res, next) {
    const ip = req.ip;
    const now = Date.now();
    const requestInfo = ipRequestMap.get(ip);
    if (!requestInfo || now - requestInfo.timestamp > rateLimitWindowMs) {
        ipRequestMap.set(ip, { count: 1, timestamp: now });
        next();
        return;
    }
    if (requestInfo.count >= maxRequestsPerWindow) {
        res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    requestInfo.count++;
    ipRequestMap.set(ip, requestInfo);
    next();
}
