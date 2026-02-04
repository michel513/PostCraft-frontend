// ==========================================
// Session Configuration
// ==========================================
export const SESSION_CONFIG = {
  maxAge: 4 * 60 * 60, // 4 hours in seconds
  cookieName: "__session",
  rotationInterval: 30 * 60, // Rotate session every 30 minutes
} as const;