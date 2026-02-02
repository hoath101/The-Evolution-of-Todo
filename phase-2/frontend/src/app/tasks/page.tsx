import { requireAuth } from "../../lib/server-auth-utils";
import { serverApiClient } from "../../lib/server-api";
import TasksClient from "./TasksClient";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  // Server-side auth validation
  const session = await requireAuth("/sign-in");
  const userId = session.user.id;

  // Fetch tasks server-side
  let tasks = [];
  try {
    tasks = await serverApiClient.getUserTasks(userId);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    // Continue with empty tasks array
  }

  return <TasksClient userId={userId} initialTasks={tasks} />;
}