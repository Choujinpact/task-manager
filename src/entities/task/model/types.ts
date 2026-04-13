export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskColor = 'red' | 'blue' | 'green' | 'purple';

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: TaskPriority;
  color: TaskColor;
}

