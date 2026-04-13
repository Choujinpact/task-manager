import type { Task, TaskColor, TaskPriority } from '../../entities/task/model/types'
import { requestJson } from './http'

type TaskDto = {
  id: number
  text: string
  completed: boolean
  priority?: TaskPriority
  color?: TaskColor
}

const normalizeTask = (task: TaskDto): Task => ({
  id: task.id,
  text: task.text,
  completed: task.completed,
  priority: task.priority ?? 'medium',
  color: task.color ?? 'red',
})

export const getTasks = async (): Promise<Task[]> => {
  const tasks = await requestJson<TaskDto[]>('/tasks')
  return tasks.map(normalizeTask)
}

export const createTask = async (payload: {
  text: string
  priority: TaskPriority
  color: TaskColor
}): Promise<Task> => {
  const created = await requestJson<TaskDto>('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return normalizeTask(created)
}

export const updateTask = async (
  id: number,
  payload: Partial<Pick<Task, 'completed' | 'text' | 'priority' | 'color'>>,
): Promise<Task> => {
  const updated = await requestJson<TaskDto>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return normalizeTask(updated)
}

export const removeTask = async (id: number): Promise<void> => {
  await requestJson(`/tasks/${id}`, {
    method: 'DELETE',
  })
}

