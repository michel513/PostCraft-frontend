/**
 * Enhanced Session Management
 * Implements session rotation, fingerprinting, and database storage
 */

import crypto from "crypto";
import { createCookieSessionStorage } from "react-router";
import type { AuthState } from "~/types";
import { SESSION_CONFIG } from "~/utils/constants";

type SessionData = {
  authState: AuthState;
  csrfToken?: string;
  fingerprint?: string;
  createdAt?: number;
  lastRotation?: number;
};

type SessionFlashData = {
  error: string;
  success: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: SESSION_CONFIG.cookieName,
      httpOnly: true,
      maxAge: SESSION_CONFIG.maxAge,
      path: "/",
      sameSite: "lax",
      secrets: [process.env.SESSION_SECRET as string],
      secure: process.env.NODE_ENV === "production",
    },
  });

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

export { getSession, commitSession, destroySession };

/**
 * Generate browser fingerprint from request
 */
export function generateFingerprint(request: Request): string {
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const acceptEncoding = request.headers.get("accept-encoding") || "";

  const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;

  return crypto.createHash("sha256").update(fingerprintData).digest("hex");
}

/**
 * Validate session fingerprint
 */
export function validateFingerprint(
  request: Request,
  sessionFingerprint?: string
): boolean {
  if (!sessionFingerprint) {
    return true; // First time, no fingerprint yet
  }

  const currentFingerprint = generateFingerprint(request);
  return currentFingerprint === sessionFingerprint;
}

/**
 * Check if session needs rotation
 */
export function needsRotation(
  session: Awaited<ReturnType<typeof getSession>>
): boolean {
  const lastRotation = session.get("lastRotation");

  if (!lastRotation) {
    return true; // First time
  }

  const timeSinceRotation = Date.now() - lastRotation;
  return timeSinceRotation > SESSION_CONFIG.rotationInterval * 1000;
}

/**
 * Rotate session (regenerate session ID)
 */
export async function rotateSession(
  request: Request,
  currentSession: Awaited<ReturnType<typeof getSession>>
): Promise<Awaited<ReturnType<typeof getSession>>> {
  // Get current session data
  const authState = currentSession.get("authState");
  const csrfToken = currentSession.get("csrfToken");

  // Create new session
  const newSession = await getSession();

  // Copy data to new session
  if (authState) {
    newSession.set("authState", authState);
  }
  if (csrfToken) {
    newSession.set("csrfToken", csrfToken);
  }

  // Set rotation timestamp and fingerprint
  newSession.set("lastRotation", Date.now());
  newSession.set("fingerprint", generateFingerprint(request));

  return newSession;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(request: Request): Promise<boolean> {
  const session = await getSession(request.headers.get("Cookie"));
  const authState = session.get("authState");

  // Validate fingerprint
  if (!validateFingerprint(request, session.get("fingerprint"))) {
    return false;
  }

  return !!authState;
}

/**
 * Get authenticated user with session validation
 */
export async function getUserAuthenticated(
  request: Request
): Promise<AuthState | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const authState = session.get("authState");

  if (!authState) {
    return null;
  }

  return authState;
}

/**
 * Create authenticated session with security features
 */
export async function createAuthSession(
  request: Request,
  authState: AuthState,
  csrfToken: string
): Promise<Awaited<ReturnType<typeof getSession>>> {
  const session = await getSession();

  session.set("authState", authState);
  session.set("csrfToken", csrfToken);
  session.set("fingerprint", generateFingerprint(request));
  session.set("createdAt", Date.now());
  session.set("lastRotation", Date.now());

  return session;
}