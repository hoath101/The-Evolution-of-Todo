export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskRequest {
  title: string;
  description?: string;
  isCompleted?: boolean;
}

export interface TaskResponse {
  success: boolean;
  data?: Task | Task[];
  error?: string;
  statusCode: number;
}