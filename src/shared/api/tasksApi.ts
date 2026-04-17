import type {
	Task,
	TaskColor,
	TaskPriority,
} from '../../entities/task/model/types'
import { requestJson } from './http'

type TaskDto = {
	id: string
	name: string // ← ИСПРАВЛЕНО: text → name
	completed: boolean
	priority?: TaskPriority
	color?: TaskColor
}

const normalizeTask = (task: TaskDto): Task => ({
	id: task.id,
	text: task.name, // ← ИСПРАВЛЕНО: task.name → task.text
	completed: task.completed,
	priority: task.priority ?? 'medium',
	color: task.color ?? 'red',
})

export const getTasks = async (): Promise<Task[]> => {
	const tasks = await requestJson<TaskDto[]>('/user/tasks', { withAuth: true })
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
			name: payload.text, // ← ИСПРАВЛЕНО: text → name
			priority: payload.priority,
			isCompleted: false,
			color: payload.color,
		}),
		withAuth: true,
	})
	return normalizeTask(created)
}

export const updateTask = async (
	id: string,
	payload: Partial<Pick<Task, 'completed' | 'text' | 'priority' | 'color'>>,
): Promise<Task> => {
	// Подготавливаем данные для бэкенда
	const updateData: any = {}

	if (payload.completed !== undefined)
		updateData.isCompleted = payload.completed
	if (payload.text !== undefined) updateData.name = payload.text // ← text → name
	if (payload.priority !== undefined) updateData.priority = payload.priority
	if (payload.color !== undefined) updateData.color = payload.color

	const updated = await requestJson<TaskDto>(`/user/tasks/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(updateData),
		withAuth: true,
	})
	return normalizeTask(updated)
}

export const removeTask = async (id: string): Promise<void> => {
	await requestJson(`/user/tasks/${id}`, {
		method: 'DELETE',
		withAuth: true,
	})
}
