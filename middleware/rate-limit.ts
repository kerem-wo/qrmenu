import { NextRequest, NextResponse } from "next/server";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated service
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options;

  return (req: NextRequest): NextResponse | null => {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const key = `rate_limit:${ip}`;
    const now = Date.now();

    // Clean up expired entries
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }

    // Initialize or get existing entry
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null; // Allow request
    }

    // Check if limit exceeded
    if (store[key].count >= maxRequests) {
      return NextResponse.json(
        {
          error: "Too many requests",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((store[key].resetTime - now) / 1000)),
            "X-RateLimit-Limit": String(maxRequests),
            "X-RateLimit-Remaining": String(Math.max(0, maxRequests - store[key].count)),
            "X-RateLimit-Reset": String(store[key].resetTime),
          },
        }
      );
    }

    // Increment count
    store[key].count++;
    return null; // Allow request
  };
}

/**
 * Default rate limiters for different endpoints
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20, // 20 uploads per hour
});
