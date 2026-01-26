import { sanitizeInput } from "./security";

/**
 * Input validation helper functions
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Turkish phone format: 05XX XXX XX XX
  const phoneRegex = /^0[5-9][0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validateSlug(slug: string): boolean {
  // Only lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
}

export function sanitizeAndValidate(input: {
  email?: string;
  phone?: string;
  slug?: string;
  name?: string;
  description?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (input.email && !validateEmail(input.email)) {
    errors.push('Geçersiz e-posta formatı');
  }

  if (input.phone && !validatePhone(input.phone)) {
    errors.push('Geçersiz telefon formatı');
  }

  if (input.slug && !validateSlug(input.slug)) {
    errors.push('Geçersiz slug formatı');
  }

  if (input.name) {
    const sanitized = sanitizeInput(input.name);
    if (sanitized.length < 2 || sanitized.length > 100) {
      errors.push('İsim 2-100 karakter arasında olmalıdır');
    }
  }

  if (input.description) {
    const sanitized = sanitizeInput(input.description);
    if (sanitized.length > 1000) {
      errors.push('Açıklama 1000 karakterden uzun olamaz');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
