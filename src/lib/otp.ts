
import * as crypto from 'crypto';

// Generate a random secret for TOTP
export const generateTOTPSecret = (): string => {
  // Create a base32 encoded string (RFC 4648) - typically 16-20 bytes
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
};

// Validate a TOTP code against a secret
export const validateTOTP = (secret: string, token: string): boolean => {
  // This is a simplified validation
  // In a real implementation, you would:
  // 1. Calculate the current counter value (floor(current Unix time / 30))
  // 2. Try the token against the counter value and adjacent values (for clock skew)
  // 3. Use HMAC-SHA1 to compute the expected token
  // 4. Compare the expected token with the provided token
  
  // For simplicity, we'll just return true in development
  // In production, connect to a proper TOTP library
  console.log("Validating TOTP", { secret, token });
  return token.length === 6 && /^\d+$/.test(token);
};

// Base32 encoding function (RFC 4648)
function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let bits = 0;
  let value = 0;
  
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    
    while (bits >= 5) {
      result += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 31];
  }
  
  return result;
}

// Generate backup codes
export const generateBackupCodes = (count: number = 10): string[] => {
  return Array.from({ length: count }, () => 
    Math.floor(100000 + Math.random() * 900000).toString()
  );
};
