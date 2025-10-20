/**
 * Security utilities for invite system
 */

// List of disposable email domains to block
const DISPOSABLE_EMAIL_DOMAINS = [
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "mailinator.com",
  "throwaway.email",
  "temp-mail.org",
  "getnada.com",
  "maildrop.cc",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.de",
  "spam4.me",
  "fakeinbox.com",
  "dispostable.com",
  "emailondeck.com",
  "mintemail.com",
  "tmpeml.info",
];

/**
 * Validate email format and check for disposable domains
 */
export function validateEmail(email: string): {
  isValid: boolean;
  isDisposable: boolean;
  error?: string;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, isDisposable: false, error: "Invalid email format" };
  }

  const domain = email.split("@")[1].toLowerCase();
  const isDisposable = DISPOSABLE_EMAIL_DOMAINS.includes(domain);

  if (isDisposable) {
    return {
      isValid: false,
      isDisposable: true,
      error: "Disposable email addresses are not allowed",
    };
  }

  return { isValid: true, isDisposable: false };
}

/**
 * Validate IP address format (IPv4 or IPv6)
 */
export function validateIpAddress(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Normalize IP address for consistent storage
 */
export function normalizeIpAddress(ip: string): string {
  return ip.trim().toLowerCase();
}

/**
 * Calculate similarity between two strings (Levenshtein distance)
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  return 1 - matrix[s2.length][s1.length] / maxLength;
}

/**
 * Check if motivation text appears to be spam or low-effort
 */
export function isMotivationSuspicious(motivation: string): boolean {
  const cleaned = motivation.toLowerCase().trim();

  // Too short
  if (cleaned.length < 20) return true;

  // Common spam patterns
  const spamPatterns = [
    /^test/,
    /^asdf/,
    /^qwerty/,
    /lorem ipsum/,
    /click here/,
    /buy now/,
    /free money/,
    /^(.)\1{5,}/, // Repeated characters
  ];

  return spamPatterns.some((pattern) => pattern.test(cleaned));
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .slice(0, 1000); // Limit length
}

/**
 * Extract IP address from request headers (for Next.js/Vercel)
 */
export function getIpFromHeaders(headers: Headers): string {
  // Check various headers that might contain the real IP
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const cfConnectingIp = headers.get("cf-connecting-ip"); // Cloudflare

  // x-forwarded-for can contain multiple IPs, take the first
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback to localhost (for development)
  return "127.0.0.1";
}
