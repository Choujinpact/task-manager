import type { Task, TaskColor, TaskPriority } from '../../entities/task/model/types'
import { requestJson } from './http'

type TaskDto = {
  id: string
  name: string
  isCompleted: boolean
  priority?: TaskPriority
}

const normalizeTask = (task: TaskDto): Task => ({
  id: task.id,
  text: task.name,
  completed: task.isCompleted,
  priority: task.priority ?? 'medium',
  color: 'red',
})

export const getTasks = async (): Promise<Task[]> => {
  const tasks = await requestJson<TaskDto[]>('/user/tasks')
  return tasks.map(normalizeTask)
}

export const createTask = async (payload: {
  text: string
  priority: TaskPriority
  color: TaskColor
}): Promise<Task> => {
  const created = await requestJson<TaskDto>('/user/tasks', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.text,
      priority: payload.priority,
    }),
  })
  return normalizeTask(created)
}

export const updateTask = async (
  id: string | number,
  payload: Partial<Pick<Task, 'completed' | 'text' | 'priority' | 'color'>>,
): Promise<Task> => {
  const updated = await requestJson<TaskDto>(`/user/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: payload.text,
      isCompleted: payload.completed,
      priority: payload.priority,
    }),
  })
  return normalizeTask(updated)
}

export const removeTask = async (id: string | number): Promise<void> => {
  await requestJson(`/user/tasks/${id}`, {
    method: 'DELETE',
  })
}

