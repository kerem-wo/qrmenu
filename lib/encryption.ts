import crypto from 'crypto';

// Encryption key - MUST be set in environment variables
// Check at runtime, not at module load time (for build compatibility)
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required for file encryption');
  }
  if (key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long for AES-256 encryption');
  }
  return key;
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const SALT_LENGTH = 64; // 64 bytes for salt
const TAG_LENGTH = 16; // 16 bytes for GCM tag
const KEY_LENGTH = 32; // 32 bytes for AES-256

// Get encryption key (validated at runtime)
function getKey(): string {
  return getEncryptionKey();
}

// Derive encryption key from environment variable
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Encrypts sensitive data (documents, images) using AES-256-GCM
 * Returns: base64 encoded string with format: salt:iv:tag:encryptedData
 */
export function encryptData(data: string | Buffer): string {
  try {
    const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from password and salt
    const encryptionKey = getKey();
    const key = deriveKey(encryptionKey, salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(dataBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine: salt:iv:tag:encryptedData
    const combined = Buffer.concat([salt, iv, tag, encrypted]);
    
    // Return as base64
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts encrypted data
 * Input: base64 encoded string with format: salt:iv:tag:encryptedData
 */
export function decryptData(encryptedData: string): Buffer {
  try {
    // Decode from base64
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    let offset = 0;
    const salt = combined.slice(offset, offset + SALT_LENGTH);
    offset += SALT_LENGTH;
    const iv = combined.slice(offset, offset + IV_LENGTH);
    offset += IV_LENGTH;
    const tag = combined.slice(offset, offset + TAG_LENGTH);
    offset += TAG_LENGTH;
    const encrypted = combined.slice(offset);
    
    // Derive key
    const encryptionKey = getKey();
    const key = deriveKey(encryptionKey, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - data may be corrupted or key is incorrect');
  }
}

/**
 * Encrypts base64 data URL (for document storage)
 */
export function encryptDataUrl(dataUrl: string): string {
  // Extract base64 part from data URL
  const base64Match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  if (!base64Match) {
    throw new Error('Invalid data URL format');
  }
  
  const base64Data = base64Match[1];
  const buffer = Buffer.from(base64Data, 'base64');
  const encrypted = encryptData(buffer);
  
  // Return encrypted data with metadata
  return `encrypted:${encrypted}`;
}

/**
 * Detect MIME type from file buffer using magic bytes
 */
function detectMimeType(buffer: Buffer): string {
  // Magic bytes for common file types
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }
  if (buffer.length >= 8 && 
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
      buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
    return 'image/png';
  }
  if (buffer.length >= 4 && 
      buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf'; // %PDF
  }
  // Default to octet-stream if type cannot be determined
  return 'application/octet-stream';
}

/**
 * Decrypts encrypted data URL
 */
export function decryptDataUrl(encryptedDataUrl: string): string {
  if (!encryptedDataUrl.startsWith('encrypted:')) {
    // If not encrypted, return as is (backward compatibility)
    return encryptedDataUrl;
  }
  
  const encryptedData = encryptedDataUrl.replace('encrypted:', '');
  const decrypted = decryptData(encryptedData);
  
  // Detect MIME type from magic bytes
  const mimeType = detectMimeType(decrypted);
  const base64 = decrypted.toString('base64');
  
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Hash sensitive data for verification (SHA-256)
 */
export function hashData(data: string | Buffer): string {
  const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  return crypto.createHash('sha256').update(dataBuffer).digest('hex');
}
