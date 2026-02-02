import { requireAuth } from "../../lib/server-auth-utils";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  // Server-side auth validation
  const session = await requireAuth("/sign-in");

  return <ProfileClient userData={session} />;
}