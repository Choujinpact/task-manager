import { requestJson } from './http'

export type PlannerSettings = {
	notificationsEnabled: boolean
	pomodoroLength: number
}

export const getSettings = async (): Promise<PlannerSettings> => {
	return requestJson<PlannerSettings>('/user/settings', { withAuth: true })
}

export const updateSettings = async (
	payload: PlannerSettings,
): Promise<PlannerSettings> => {
	return requestJson<PlannerSettings>('/user/settings', {
		method: 'PATCH',
		body: JSON.stringify(payload),
		withAuth: true,
	})
}
