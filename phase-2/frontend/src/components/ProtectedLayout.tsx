import { requireAuth } from "../lib/server-auth-utils";
import AppShell from "./AppShell";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  // Validate auth but don't pass session to AppShell since it handles session client-side
  await requireAuth("/sign-in");

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}