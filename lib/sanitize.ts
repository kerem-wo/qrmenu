/**
 * Sanitize string input to prevent XSS attacks
 * Simple implementation - for production, consider using DOMPurify
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  
  // Basic HTML entity escaping
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeString(sanitized[key]) as T[Extract<keyof T, string>];
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeObject(sanitized[key]) as T[Extract<keyof T, string>];
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].map((item: any) =>
        typeof item === "string" ? sanitizeString(item) : typeof item === "object" ? sanitizeObject(item) : item
      ) as T[Extract<keyof T, string>];
    }
  }
  
  return sanitized;
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  return sanitizeString(email).toLowerCase().trim();
}

/**
 * Sanitize phone number (remove non-numeric characters except +)
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
