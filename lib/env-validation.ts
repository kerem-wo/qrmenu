/**
 * Environment Variable Validation
 * Ensures all required security variables are set
 */

export function validateEnvironmentVariables() {
  const required = [
    'DATABASE_URL',
    'ENCRYPTION_KEY',
  ];

  const optional = [
    'PLATFORM_ADMIN_PASSWORD',
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please set these in your .env.local file'
    );
  }

  // Validate ENCRYPTION_KEY length (should be at least 32 characters)
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
    throw new Error(
      'ENCRYPTION_KEY must be at least 32 characters long for AES-256 encryption'
    );
  }

  return true;
}

// Validate on module load
if (typeof window === 'undefined') {
  try {
    validateEnvironmentVariables();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // Don't throw in development to allow for easier setup
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}
