import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./db/schema"; // Import the schema with correct column definitions

// Check if we're running in a CLI context (during migrations)
const isCLI = process.argv.some(arg =>
  arg.includes('better-auth') || arg.includes('migrate')
);

// Only validate environment variables in non-CLI contexts
if (!isCLI) {
  if (!process.env.BETTER_AUTH_SECRET) {
    console.error("BETTER_AUTH_SECRET is required");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
}

// Create the PostgreSQL pool with better error handling
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy",
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : undefined, // Only apply SSL settings if DATABASE_URL is provided
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Increased timeout
});

// Optional: Add error logging for database connection issues
dbPool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

// Create Drizzle instance with the schema
const db = drizzle(dbPool, { schema });

const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "supersecret-session-key-fallback",
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://todo-workspace.vercel.app",
  trustHost: false, // Temporarily disable strict host validation to fix session issues in production
  database: drizzleAdapter(db, { provider: "pg" }), // Use the Drizzle adapter with proper schema
  advanced: {
    // Configure cookies to work properly in production environment
    cookies: {
      session_token: {
        // Ensure the cookie is accessible across the entire domain
        attributes: {
          secure: process.env.NODE_ENV === "production", // Secure in production (HTTPS)
          sameSite: "lax", // Allow some cross-site requests
          path: "/", // Available across the entire site
          httpOnly: true, // Prevent client-side access for security
          maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
          domain: "", // Don't set domain to allow default behavior
        }
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    signInVerification: true,
  },
  account: {
    accountLinking: {
      enabled: true,
    }
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  plugins: [
    jwt()
  ],
  // Add error handling configuration
  onAPIError: {
    throw: true,
    onError: (error, ctx) => {
      console.error("Better Auth API Error:", error);
    }
  }
});

export { auth };
export default auth; // Add default export for CLI
