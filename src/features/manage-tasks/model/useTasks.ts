import { useEffect, useState } from 'react'
import type {
	Task,
	TaskColor,
	TaskPriority,
} from '../../../entities/task/model/types'
import {
	createTask,
	getTasks,
	removeTask,
	updateTask,
} from '../../../shared/api/tasksApi'

const TASKS_STORAGE_KEY = 'red_planner_tasks'

export const useTasks = (initial: Task[] = []) => {
	const [tasks, setTasks] = useState<Task[]>(() => {
		const raw = window.localStorage.getItem(TASKS_STORAGE_KEY)
		if (!raw) return initial
		try {
			const parsed = JSON.parse(raw) as Array<Partial<Task>>
			if (Array.isArray(parsed)) {
				return parsed.map(task => ({
					id: task.id ?? String(Date.now()), // Исправлено: Date.now() → String(Date.now())
					text: task.text ?? '',
					completed: Boolean(task.completed),
					priority: (task.priority as TaskPriority) ?? 'medium',
					color: (task.color as TaskColor) ?? 'red',
				}))
			}
		} catch {
			// ignore invalid localStorage payload
		}
		return initial
	})

	useEffect(() => {
		window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
	}, [tasks])

	useEffect(() => {
		const loadTasks = async () => {
			try {
				const remoteTasks = await getTasks()
				setTasks(remoteTasks)
			} catch {
				// Backend may be unavailable during frontend-only development.
			}
		}
		void loadTasks()
	}, [])

	const addTask = (
		text: string,
		options: { priority: TaskPriority; color: TaskColor },
	) => {
		const trimmed = text.trim()
		if (!trimmed) return
		const optimisticTask: Task = {
			id: String(Date.now()), // Исправлено: Date.now() → String(Date.now())
			text: trimmed,
			completed: false,
			priority: options.priority,
			color: options.color,
		}

		setTasks(prev => [...prev, optimisticTask])

		const syncTask = async () => {
			try {
				const created = await createTask({
					text: trimmed,
					priority: options.priority,
					color: options.color,
				})
				setTasks(prev =>
					prev.map(task => (task.id === optimisticTask.id ? created : task)),
				)
			} catch {
				// Keep optimistic local task if backend is unavailable.
			}
		}
		void syncTask()
	}

	const toggleTask = (id: string) => {
		// Исправлено: number → string
		let nextCompleted = false
		setTasks(prev =>
			prev.map(t => {
				if (t.id === id) {
					nextCompleted = !t.completed
					return { ...t, completed: nextCompleted }
				}
				return t
			}),
		)

		const syncTask = async () => {
			try {
				await updateTask(id, { completed: nextCompleted })
			} catch {
				// ignore API failure and keep local state
			}
		}
		void syncTask()
	}

	const deleteTask = (id: string) => {
		// Исправлено: number → string
		setTasks(prev => prev.filter(t => t.id !== id))

		const syncTask = async () => {
			try {
				await removeTask(id)
			} catch {
				// ignore API failure and keep local state
			}
		}
		void syncTask()
	}

	return { tasks, addTask, toggleTask, deleteTask }
}
