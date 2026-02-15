import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Session } from "next-auth";

/**
 * Authentication middleware utilities for API routes
 * Provides standardized auth checks and role-based access control
 */

export type Role = "USER" | "ORGANIZER" | "ADMIN";

export interface AuthSession extends Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    isVerified: boolean;
    profilePictureUrl?: string | null;
  };
}

export interface AuthError {
  error: string;
}

/**
 * Validates that a session exists and returns the session or an error response
 */
export async function requireAuth(): Promise<
  { session: AuthSession } | { error: NextResponse }
> {
  const session = await auth();

  if (!session || !session.user?.id) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized - valid session required" },
        { status: 401 }
      ),
    };
  }

  return { session: session as AuthSession };
}

/**
 * Validates that a session exists with a specific user ID
 */
export async function requireAuthWithId(
  userId: string
): Promise<{ session: AuthSession } | { error: NextResponse }> {
  const authResult = await requireAuth();

  if ("error" in authResult) {
    return authResult;
  }

  if (authResult.session.user.id !== userId) {
    return {
      error: NextResponse.json(
        { error: "Forbidden - access denied" },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Validates that a session exists with one of the required roles
 */
export async function requireRole(
  allowedRoles: Role[]
): Promise<{ session: AuthSession } | { error: NextResponse }> {
  const authResult = await requireAuth();

  if ("error" in authResult) {
    return authResult;
  }

  const userRole = authResult.session.user.role;

  if (!allowedRoles.includes(userRole)) {
    const rolesText = allowedRoles.join(" or ");
    return {
      error: NextResponse.json(
        { error: `Forbidden - ${rolesText} role required` },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Validates that a session exists as an organizer or admin
 */
export async function requireOrganizer(): Promise<
  { session: AuthSession } | { error: NextResponse }
> {
  return requireRole(["ORGANIZER", "ADMIN"]);
}

/**
 * Validates that a session exists as an admin
 */
export async function requireAdmin(): Promise<
  { session: AuthSession } | { error: NextResponse }
> {
  return requireRole(["ADMIN"]);
}

/**
 * Type guard to check if auth result is an error response
 */
export function isAuthError(
  result: { session: AuthSession } | { error: NextResponse }
): result is { error: NextResponse } {
  return "error" in result;
}

/**
 * Wrapper to handle auth checks with cleaner syntax
 * Usage:
 * 
 * const authResult = await withAuth(req);
 * if (isAuthError(authResult)) return authResult.error;
 * const { session } = authResult;
 */
export const withAuth = requireAuth;

/**
 * Higher-order function to wrap route handlers with auth
 * Usage:
 * 
 * export const GET = withAuthHandler(async (req, session) => {
 *   // Your handler code with guaranteed auth
 *   return NextResponse.json({ data: "protected" });
 * });
 */
export function withAuthHandler(
  handler: (req: NextRequest, session: AuthSession) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authResult = await requireAuth();

    if (isAuthError(authResult)) {
      return authResult.error;
    }

    return handler(req, authResult.session);
  };
}

/**
 * Higher-order function to wrap route handlers with role-based auth
 */
export function withRoleHandler(
  allowedRoles: Role[],
  handler: (req: NextRequest, session: AuthSession) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authResult = await requireRole(allowedRoles);

    if (isAuthError(authResult)) {
      return authResult.error;
    }

    return handler(req, authResult.session);
  };
}

/**
 * Higher-order function to wrap route handlers with organizer auth
 */
export function withOrganizerHandler(
  handler: (req: NextRequest, session: AuthSession) => Promise<NextResponse>
) {
  return withRoleHandler(["ORGANIZER", "ADMIN"], handler);
}

/**
 * Higher-order function to wrap route handlers with admin auth
 */
export function withAdminHandler(
  handler: (req: NextRequest, session: AuthSession) => Promise<NextResponse>
) {
  return withRoleHandler(["ADMIN"], handler);
}
