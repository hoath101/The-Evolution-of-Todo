import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./server-auth";

export async function getCurrentSession() {
  try {
    // Use Better Auth's server-side session validation with headers
    const session = await auth.api.getSession({
      headers: await headers()
    });

    return session;
  } catch (error) {
    console.error("Server session validation failed:", error);
    return null;
  }
}

export async function requireAuth(redirectPath = "/sign-in") {
  const session = await getCurrentSession();

  if (!session) {
    // Use Next.js server-side redirect
    redirect(redirectPath);
  }

  return session;
}