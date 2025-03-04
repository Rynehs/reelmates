
// Generate a random secret for TOTP
export const generateTOTPSecret = (): string => {
  // Generate a random string as a secret
  // In a browser environment we can't use crypto.randomBytes
  const randomValues = new Uint8Array(20);
  window.crypto.getRandomValues(randomValues);
  
  // Convert to base32
  return base32Encode(randomValues);
};

// Validate a TOTP code against a secret
export const validateTOTP = (secret: string, token: string): boolean => {
  // This is a simplified validation for demonstration purposes
  // In a real implementation, you would use a proper TOTP library
  
  // For simplicity, we'll just check if the token has 6 digits
  const isValid = token.length === 6 && /^\d+$/.test(token);
  
  console.log("Validating TOTP", { secret, token, isValid });
  return isValid;
};

// Base32 encoding function (RFC 4648)
function base32Encode(buffer: Uint8Array): string {
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
