import { Request, Response, NextFunction } from "express";

const IP_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function globalRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  
  let record = requestCounts.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + IP_WINDOW_MS };
  }
  
  record.count++;
  requestCounts.set(ip, record);
  
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: {
        message: "Too many requests. Please try again later.",
        status: 429,
      },
    });
    return;
  }
  
  next();
}
