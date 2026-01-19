import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/types/api";

/**
 * Standard API success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Standard API error response
 */
export function errorResponse(
  error: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error,
      ...(code && { code }),
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse<ApiError> {
  return errorResponse(message, 401, "UNAUTHORIZED");
}

/**
 * Not found response
 */
export function notFoundResponse(message: string = "Not found"): NextResponse<ApiError> {
  return errorResponse(message, 404, "NOT_FOUND");
}

/**
 * Internal server error response
 */
export function internalErrorResponse(
  message: string = "Internal server error",
  error?: any
): NextResponse<ApiError> {
  console.error("Internal error:", error);
  return errorResponse(
    message,
    500,
    "INTERNAL_ERROR",
    process.env.NODE_ENV === "development" ? error : undefined
  );
}

/**
 * Validation error response
 */
export function validationErrorResponse(
  errors: any,
  message: string = "Validation error"
): NextResponse<ApiError> {
  return errorResponse(message, 400, "VALIDATION_ERROR", errors);
}
