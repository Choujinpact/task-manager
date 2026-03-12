import React, { useMemo, useState } from 'react';
import type { Task } from '../../../entities/task/model/types';

const initialTasks: Task[] = [
  {
    id: Date.now() + 1,
    text: 'Сделать курсовую работу',
    completed: false,
  },
  { id: Date.now() + 2, text: 'Купить продукты', completed: true },
  { id: Date.now() + 3, text: 'Позвонить родителям', completed: false },
];

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [inputValue, setInputValue] = useState<string>('');

  const { completedCount, totalCount, progress } = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    return { completedCount: completed, totalCount: total, progress: percent };
  }, [tasks]);

  const handleAddTask = () => {
    const text = inputValue.trim();
    if (!text) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text, completed: false },
    ]);
    setInputValue('');
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">📋 Задачи</h2>

      <div className="add-task">
        <input
          type="text"
          className="task-input"
          placeholder="Новая задача..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn-primary" onClick={handleAddTask}>
          Добавить
        </button>
      </div>

      <div className="task-list">
        {tasks.map((task) => (
          <div className="task-item" key={task.id}>
            <input
              type="checkbox"
              className="task-check"
              checked={task.completed}
              onChange={() => handleToggleTask(task.id)}
            />
            <span
              className={
                'task-text' + (task.completed ? ' completed' : '')
              }
            >
              {task.text}
            </span>
            <button
              className="delete-task"
              title="Удалить"
              onClick={() => handleDeleteTask(task.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, color: '#b15353', fontWeight: 500 }}>
        Выполнено: {completedCount} из {totalCount} ({progress}%)
      </div>
    </div>
  );
};

