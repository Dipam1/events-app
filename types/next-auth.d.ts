import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  // 1. Extend the 'Session' interface
  interface Session {
    user: {
      id: string;
      role: string;
      isVerified: boolean;
      profilePictureUrl?: string | null; // Add your custom field
    } & DefaultSession["user"];
  }

  // 2. Extend the 'User' interface (returned from authorize)
  interface User {
    id: string;
    role: string;
    isVerified: boolean;
    profilePictureUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  // 3. Extend the JWT token to hold these fields
  interface JWT {
    id: string;
    role: string;
    isVerified: boolean;
    profilePictureUrl?: string | null;
  }
}
