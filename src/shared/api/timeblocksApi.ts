import { requestJson } from './http'

export type TimeBlockApiModel = {
	id: string
	name: string // ← name вместо title
	color?: string
	duration: number // ← duration в минутах
	order?: number
	startDateTime?: string // опционально для совместимости
	endDateTime?: string // опционально для совместимости
}

export const getTimeBlocks = async (): Promise<TimeBlockApiModel[]> => {
	return requestJson<TimeBlockApiModel[]>('/user/time-blocks', {
		withAuth: true,
	})
}

export const createTimeBlock = async (payload: {
	title: string
	startDateTime: string
	endDateTime: string
}): Promise<TimeBlockApiModel> => {
	// Вычисляем длительность в минутах
	const start = new Date(payload.startDateTime)
	const end = new Date(payload.endDateTime)
	const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60)

	return requestJson<TimeBlockApiModel>('/user/time-blocks', {
		method: 'POST',
		body: JSON.stringify({
			name: payload.title, // title → name
			duration: duration, // вычисленная длительность
			color: '#3b82f6', // цвет по умолчанию
			order: 0, // порядок по умолчанию
		}),
		withAuth: true,
	})
}

export const removeTimeBlock = async (id: string): Promise<void> => {
	await requestJson(`/user/time-blocks/${id}`, {
		method: 'DELETE',
		withAuth: true,
	})
}
