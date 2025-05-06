import { NextFunction, Request, Response } from "express";

const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 10;

const ipRequestMap = new Map<string, { count: number; timestamp: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip!;
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