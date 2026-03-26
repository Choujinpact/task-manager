import { useEffect, useState } from 'react'

export interface Task {
  id: number
  text: string
  completed: boolean
}

const TASKS_STORAGE_KEY = 'red_planner_tasks'

export const useTasks = (initial: Task[] = []) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY)
    if (!raw) return initial
    try {
      const parsed = JSON.parse(raw) as Task[]
      if (Array.isArray(parsed)) return parsed
    } catch {
      // ignore invalid localStorage payload
    }
    return initial
  })

  useEffect(() => {
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, completed: false },
    ])
  }

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return { tasks, addTask, toggleTask, deleteTask }
}
