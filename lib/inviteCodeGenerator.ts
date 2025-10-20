/**
 * Invite code generation utilities
 */

/**
 * Generate a secure random invite code
 * Format: 8 characters, alphanumeric uppercase (excluding similar-looking chars)
 * Example: FX7K2M9P
 */
export function generateInviteCode(): string {
  // Exclude similar-looking characters: 0, O, 1, I, L
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code;
}

/**
 * Generate multiple unique invite codes
 */
export function generateMultipleCodes(count: number): string[] {
  const codes = new Set<string>();

  while (codes.size < count) {
    codes.add(generateInviteCode());
  }

  return Array.from(codes);
}

/**
 * Validate invite code format
 */
export function isValidCodeFormat(code: string): boolean {
  const validChars = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/;
  return validChars.test(code);
}

/**
 * Format code for display (adds dash in middle)
 * Example: FX7K-2M9P
 */
export function formatCodeForDisplay(code: string): string {
  if (code.length !== 8) return code;
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/**
 * Remove formatting from user input
 */
export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[-\s]/g, "");
}

/**
 * Calculate expiration timestamp (30 days from now)
 */
export function getCodeExpirationTime(): number {
  return Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
}

/**
 * Check if a code is expired
 */
export function isCodeExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}
