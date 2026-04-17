import { requestJson } from './http'

export type PlannerSettings = {
  notificationsEnabled: boolean
  pomodoroLength: number
}

type ProfileResponse = {
  user?: {
    workInterval?: number
  }
}

export const getSettings = async (): Promise<PlannerSettings> => {
  const profile = await requestJson<ProfileResponse>('/user/profile')
  return {
    notificationsEnabled: true,
    pomodoroLength: profile.user?.workInterval ?? 25,
  }
}

export const updateSettings = async (
  payload: PlannerSettings,
): Promise<PlannerSettings> => {
  await requestJson('/user/profile', {
    method: 'PUT',
    body: JSON.stringify({
      workInterval: payload.pomodoroLength,
    }),
  })
  return payload
}

