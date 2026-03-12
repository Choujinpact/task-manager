import { useState } from 'react';

export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export const useTasks = (initial: Task[] = []) => {
  const [tasks, setTasks] = useState<Task[]>(initial);

  const addTask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, completed: false },
    ]);
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, addTask, toggleTask, deleteTask };
};

