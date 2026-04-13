import { requestJson } from './http'

export type PlannerSettings = {
  notificationsEnabled: boolean
  pomodoroLength: number
}

export const getSettings = async (): Promise<PlannerSettings> => {
  return requestJson<PlannerSettings>('/settings')
}

export const updateSettings = async (
  payload: PlannerSettings,
): Promise<PlannerSettings> => {
  return requestJson<PlannerSettings>('/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

