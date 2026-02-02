interface TaskDetailProps {
  task: {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
  };
}

export default function TaskDetail({ task }: TaskDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={task.completed}
            disabled
            className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 mt-1"
          />
          <div className="ml-4">
            <h3 className={`text-lg leading-6 font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className={`mt-1 text-sm sm:mt-0 sm:col-span-2 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.description || "No description provided"}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className={`mt-1 text-sm sm:mt-0 sm:col-span-2 ${task.completed ? 'text-green-600' : 'text-yellow-600'}`}>
              {task.completed ? 'Completed' : 'Pending'}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(task.created_at)}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(task.updated_at)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}