import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { jwt, customSession } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  secret: process.env.BETTER_AUTH_SECRET || "your-super-secret-key-change-this-in-development",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to false for development
  },
  account: {
    accountLinking: {
      enabled: true,
    }
  },
  socialProviders: {
    // Add social providers as needed
  },
  session: {
    expiresIn: 86400, // Session expires in 24 hours (86400 seconds)
  },
  // Trusted origins configuration to allow requests from frontend
  trustedOrigins: [
    "http://localhost:3000",  // Next.js default port
    "http://localhost:3001",  // Alternative Next.js port
    "http://localhost:5173",  // Vite default port
    "http://localhost:8000",  // Backend port
    "http://127.0.0.1:3000",  // Alternative localhost format
    "http://127.0.0.1:3001",  // Alternative localhost format
    "http://127.0.0.1:5173",  // Alternative localhost format
    "http://127.0.0.1:8000",  // Alternative localhost format
    "http://127.0.0.1:4000",  // Self for local access
    "http://localhost:4000",  // Same origin for auth service
  ],
  // Disable origin check since we're using a proxy
  advanced: {
    disableOriginCheck: true,
  },
  plugins: [
    jwt(),
    customSession(async ({ user, session }) => {
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
        session: {
          id: session.id,
          userId: session.userId,
          expiresAt: session.expiresAt,
        }
      };
    })
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Additional logic for all authentication requests can be added here
      // You can check ctx.path to determine the specific action
      if (ctx.path.includes('/sign-in')) {
        // Logic for sign-in
        console.log('Sign-in attempt');
      } else if (ctx.path.includes('/sign-up')) {
        // Logic for sign-up
        console.log('Sign-up attempt');
      }
      return {
        context: ctx
      };
    }),
    after: createAuthMiddleware(async (ctx) => {
      // Additional logic after authentication requests can be added here
      if (ctx.path.includes('/sign-in')) {
        // Logic after sign-in
        console.log('Sign-in completed');
      } else if (ctx.path.includes('/sign-up')) {
        // Logic after sign-up
        console.log('Sign-up completed');
      }
      return {
        context: ctx
      };
    })
  },
});