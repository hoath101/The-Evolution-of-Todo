import { requireAuth } from "../../../lib/server-auth-utils";
import { serverApiClient } from "../../../lib/server-api";
import TaskDetailClient from "./TaskDetailClient";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  // Server-side auth validation
  const session = await requireAuth("/sign-in");
  const userId = session.user.id;

  // Fetch task data server-side
  let task;
  try {
    task = await serverApiClient.getTask(userId, params.id);
  } catch (error) {
    // If there's an error fetching the task, we'll handle it in the client component
    // but we should redirect if it's an auth error
    if (error instanceof Error &&
        (error.message.toLowerCase().includes('auth') ||
         error.message.toLowerCase().includes('unauthorized'))) {
      // This should ideally redirect, but we're in a server component
      // The client component will handle this case
    }
    task = null;
  }

  if (!task) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4">Task not found</h2>
        <a
          href="/tasks"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Tasks
        </a>
      </div>
    );
  }

  return <TaskDetailClient userId={userId} initialTask={task} />;
}