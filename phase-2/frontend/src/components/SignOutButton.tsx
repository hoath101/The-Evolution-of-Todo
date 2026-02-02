"use client";

import { useRouter } from "next/navigation";
import { signOut } from "../lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to sign-in page after signing out
      router.push("/sign-in");
      router.refresh(); // Refresh to update the UI
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      Sign out
    </button>
  );
}