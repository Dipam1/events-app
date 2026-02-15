# API Authentication Middleware

## Overview

A centralized authentication middleware system for API routes that provides standardized auth checks, role-based access control, and cleaner code patterns.

## Location

`lib/api-middleware.ts`

## Features

- **Session validation**: Ensure users are authenticated
- **Role-based access control**: Restrict routes to specific roles (USER, ORGANIZER, ADMIN)
- **Ownership validation**: Helper to check if a user owns a resource
- **Type safety**: Full TypeScript support with proper session typing
- **Consistent error responses**: Standardized 401/403 responses
- **Clean syntax**: Reduce boilerplate in route handlers

## Available Functions

### Core Auth Functions

#### `requireAuth()`
Validates that a session exists.

```typescript
const authResult = await requireAuth();
if (isAuthError(authResult)) return authResult.error;
const { session } = authResult;
```

#### `requireRole(allowedRoles: Role[])`
Validates that a session exists with one of the specified roles.

```typescript
const authResult = await requireRole(["ORGANIZER", "ADMIN"]);
if (isAuthError(authResult)) return authResult.error;
const { session } = authResult;
```

#### `requireOrganizer()`
Validates that a session exists with ORGANIZER or ADMIN role.

```typescript
const authResult = await requireOrganizer();
if (isAuthError(authResult)) return authResult.error;
const { session } = authResult;
```

#### `requireAdmin()`
Validates that a session exists with ADMIN role.

```typescript
const authResult = await requireAdmin();
if (isAuthError(authResult)) return authResult.error;
const { session } = authResult;
```

#### `requireAuthWithId(userId: string)`
Validates that a session exists and belongs to a specific user ID.

```typescript
const authResult = await requireAuthWithId(userId);
if (isAuthError(authResult)) return authResult.error;
const { session } = authResult;
```

### Helper Functions

#### `isAuthError(result)`
Type guard to check if auth result is an error.

```typescript
const authResult = await requireAuth();
if (isAuthError(authResult)) {
  return authResult.error; // Return 401/403 response
}
// TypeScript now knows authResult has session property
const { session } = authResult;
```

### Higher-Order Functions (Advanced)

#### `withAuthHandler(handler)`
Wraps a route handler with authentication.

```typescript
export const GET = withAuthHandler(async (req, session) => {
  // session is guaranteed to exist
  return NextResponse.json({ userId: session.user.id });
});
```

#### `withOrganizerHandler(handler)`
Wraps a route handler with organizer/admin authentication.

```typescript
export const POST = withOrganizerHandler(async (req, session) => {
  // session exists and user is ORGANIZER or ADMIN
  return NextResponse.json({ event: "created" });
});
```

## Usage Examples

### Basic Authentication

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult.error;
    const { session } = authResult;

    // Your authenticated logic here
    return NextResponse.json({ 
      userId: session.user.id,
      email: session.user.email 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

### Role-Based Access

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireOrganizer, isAuthError } from "@/lib/api-middleware";

export async function POST(req: NextRequest) {
  try {
    // Only ORGANIZER and ADMIN can access
    const authResult = await requireOrganizer();
    if (isAuthError(authResult)) return authResult.error;
    const { session } = authResult;

    const body = await req.json();
    
    // Create event logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

### Ownership Validation

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/api-middleware";

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult.error;
    const { session } = authResult;

    const { key } = await req.json();

    // Validate ownership
    const expectedPrefix = `videos/${session.user.id}/`;
    if (!key.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Forbidden - you can only delete your own videos" },
        { status: 403 }
      );
    }

    // Delete logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

### Using Higher-Order Functions

```typescript
import { NextRequest, NextResponse } from "next/server";
import { withAuthHandler, withOrganizerHandler } from "@/lib/api-middleware";

// Simple authenticated route
export const GET = withAuthHandler(async (req, session) => {
  return NextResponse.json({ 
    message: "Hello",
    user: session.user.name 
  });
});

// Organizer-only route
export const POST = withOrganizerHandler(async (req, session) => {
  const body = await req.json();
  // Create event logic
  return NextResponse.json({ 
    success: true,
    organizerId: session.user.id 
  });
});
```

## Migration Guide

### Before (Old Pattern)

```typescript
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  if (session.user.role !== "ORGANIZER") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
  
  // Your logic
}
```

### After (New Pattern)

```typescript
import { requireOrganizer, isAuthError } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  const authResult = await requireOrganizer();
  if (isAuthError(authResult)) return authResult.error;
  const { session } = authResult;
  
  // Your logic - guaranteed authenticated as organizer
}
```

## Type Definitions

```typescript
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
```

## Error Responses

### 401 Unauthorized
Returned when no valid session exists.

```json
{
  "error": "Unauthorized - valid session required"
}
```

### 403 Forbidden
Returned when user lacks required role or permissions.

```json
{
  "error": "Forbidden - ORGANIZER or ADMIN role required"
}
```

## Best Practices

1. **Always handle auth first**: Check authentication before any business logic
2. **Use type guards**: Use `isAuthError()` for proper TypeScript narrowing
3. **Validate ownership**: For user-specific resources, verify the user owns the resource
4. **Consistent error handling**: Let the middleware handle auth errors, wrap route logic in try-catch for other errors
5. **Choose the right function**: Use `requireOrganizer()` instead of `requireRole(["ORGANIZER", "ADMIN"])` for cleaner code

## Refactored Routes

The following routes have been refactored to use this middleware:

- `/api/event-image-upload` - Organizer auth + ownership validation
- `/api/event` - Organizer auth + validation improvements
- `/api/get-image` - Auth + path validation + ownership checks
- `/api/video-upload/complete` - Auth
- `/api/video-upload/start` - Auth + filename sanitization
- `/api/user` - Auth
- `/api/user-avatar-upload` - Auth
- `/api/user-avatar-upload/confirm-upload` - Auth

## Benefits

✅ **Reduced boilerplate**: 5-10 lines of auth code → 3 lines  
✅ **Consistent error messages**: Standardized across all routes  
✅ **Type safety**: Full TypeScript support with proper session typing  
✅ **Better maintainability**: Changes to auth logic happen in one place  
✅ **Clearer code**: Intent is obvious from function names  
✅ **Less error-prone**: Centralized validation reduces mistakes
