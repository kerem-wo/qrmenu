import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { handleError } from "./errors";
import { errorResponse, validationErrorResponse, unauthorizedResponse } from "./api-response";
import { logger } from "./logger";
import { sanitizeObject } from "./sanitize";
import { getAdminSession } from "./auth";

interface ApiHandlerOptions {
  validate?: {
    body?: ZodSchema;
    query?: ZodSchema;
  };
  requireAuth?: boolean;
  rateLimit?: (req: NextRequest) => NextResponse | null;
}

// Store validated body for handler access
const validatedBodyMap = new WeakMap<NextRequest, any>();

/**
 * Get validated body from request (set by createApiHandler)
 */
export function getValidatedBody<T = any>(req: NextRequest): T | null {
  return validatedBodyMap.get(req) || null;
}

/**
 * Wrapper for API route handlers with validation, error handling, and rate limiting
 */
export function createApiHandler<T = any>(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse<T>>,
  options: ApiHandlerOptions = {}
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Rate limiting
      if (options.rateLimit) {
        const rateLimitResponse = options.rateLimit(req);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      }

      // Authentication check
      if (options.requireAuth) {
        const session = await getAdminSession();
        if (!session) {
          return unauthorizedResponse("Unauthorized");
        }
      }

      // Validate query parameters
      if (options.validate?.query) {
        const url = new URL(req.url);
        const queryParams: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        try {
          options.validate.query.parse(queryParams);
        } catch (error) {
          if (error instanceof ZodError) {
            return validationErrorResponse(error.errors);
          }
        }
      }

      // Validate request body
      if (options.validate?.body && req.method !== "GET" && req.method !== "DELETE") {
        try {
          const body = await req.json();
          const sanitizedBody = sanitizeObject(body);
          const validatedBody = options.validate.body.parse(sanitizedBody);
          
          // Store validated body for handler access
          validatedBodyMap.set(req, validatedBody);
        } catch (error) {
          if (error instanceof ZodError) {
            return validationErrorResponse(error.errors);
          }
          throw error;
        }
      }

      return handler(req, context);
    } catch (error) {
      logger.error("API handler error", error as Error);
      const { message, statusCode, code, details } = handleError(error);
      return errorResponse(message, statusCode, code, details);
    }
  };
}

/**
 * Parse JSON body safely
 */
export async function parseJsonBody<T = any>(req: NextRequest): Promise<T> {
  try {
    const text = await req.text();
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error("Invalid JSON body");
  }
}
