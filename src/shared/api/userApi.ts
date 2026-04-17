import { ApiError, requestJson } from './http'

export type PomodoroSettings = {
  workInterval: number
  breakInterval: number
  intervalCount: number
}

export type UserProfile = {
  id: string
  email: string
  name: string | null
  pomodoroSettings: PomodoroSettings
}

type BackendUserModel = {
  id: string
  email: string
  name?: string | null
  workInterval?: number | null
  breakInterval?: number | null
  intervalCount?: number | null
}

type BackendProfileWrappedResponse = {
  user: BackendUserModel
}

type BackendFlatUserResponse = Partial<BackendUserModel> & {
  email?: string
  name?: string | null
}

export type UserDto = {
  email: string
  password: string
  name?: string
  workInterval?: number
  breakInterval?: number
  intervalCount?: number
}

type LocalUserProfileRecord = {
  id: string
  email: string
  name: string | null
  pomodoroSettings: PomodoroSettings
}

const LOCAL_SESSION_USER_ID_KEY = 'red_planner_local_auth_session_user_id'
const LOCAL_PROFILES_KEY = 'red_planner_local_auth_profiles'

const isApiOfflineError = (error: unknown): boolean => {
  if (
    error instanceof Error &&
    error.message.includes('Не удалось подключиться к API')
  ) {
    return true
  }

  if (error instanceof ApiError && [502, 503, 504].includes(error.status)) {
    return true
  }

  if (
    error instanceof Error &&
    error.message.toLowerCase().includes('error occurred while trying to proxy')
  ) {
    return true
  }

  return false
}

const readLocalProfiles = (): LocalUserProfileRecord[] => {
  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalUserProfileRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveLocalProfiles = (profiles: LocalUserProfileRecord[]) => {
  window.localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles))
}

const getLocalSessionUserId = (): string => {
  const userId = window.localStorage.getItem(LOCAL_SESSION_USER_ID_KEY)
  if (!userId) {
    throw new Error('Профиль недоступен: нет активной сессии')
  }
  return userId
}

const normalizeProfile = (data: unknown): UserProfile => {
  const fallback: UserProfile = {
    id: '',
    email: '',
    name: null,
    pomodoroSettings: {
      workInterval: 25,
      breakInterval: 5,
      intervalCount: 4,
    },
  }

  if (!data || typeof data !== 'object') return fallback

  // 1) Спецификация фронта: { id, email, name, pomodoroSettings }
  if ('pomodoroSettings' in data) {
    const d = data as Partial<UserProfile>
    const ps = (d.pomodoroSettings ?? {}) as Partial<PomodoroSettings>
    return {
      id: d.id ?? fallback.id,
      email: d.email ?? fallback.email,
      name: d.name ?? fallback.name,
      pomodoroSettings: {
        workInterval: ps.workInterval ?? fallback.pomodoroSettings.workInterval,
        breakInterval: ps.breakInterval ?? fallback.pomodoroSettings.breakInterval,
        intervalCount: ps.intervalCount ?? fallback.pomodoroSettings.intervalCount,
      },
    }
  }

  // 2) Текущий бэк: { user: { ...fields }, statistics?: ... }
  if ('user' in data) {
    const wrapped = data as BackendProfileWrappedResponse
    const u = wrapped.user
    return {
      id: u?.id ?? fallback.id,
      email: u?.email ?? fallback.email,
      name: (u?.name ?? null) as string | null,
      pomodoroSettings: {
        workInterval: u?.workInterval ?? fallback.pomodoroSettings.workInterval,
        breakInterval: u?.breakInterval ?? fallback.pomodoroSettings.breakInterval,
        intervalCount: u?.intervalCount ?? fallback.pomodoroSettings.intervalCount,
      },
    }
  }

  // 3) PUT /user/profile в текущем бэке может вернуть плоский объект { email, name }
  if ('email' in data) {
    const u = data as BackendFlatUserResponse
    return {
      id: u.id ?? fallback.id,
      email: u.email ?? fallback.email,
      name: (u.name ?? null) as string | null,
      pomodoroSettings: {
        workInterval: u.workInterval ?? fallback.pomodoroSettings.workInterval,
        breakInterval: u.breakInterval ?? fallback.pomodoroSettings.breakInterval,
        intervalCount: u.intervalCount ?? fallback.pomodoroSettings.intervalCount,
      },
    }
  }

  return fallback
}

export const getProfile = async (): Promise<UserProfile> => {
  try {
    const raw = await requestJson<unknown>('/user/profile', {
      method: 'GET',
      withAuth: true,
    })
    return normalizeProfile(raw)
  } catch (error) {
    if (!isApiOfflineError(error)) throw error
    const userId = getLocalSessionUserId()
    const profiles = readLocalProfiles()
    const profile = profiles.find((candidate) => candidate.id === userId)
    if (!profile) {
      throw new Error('Профиль пользователя не найден')
    }
    return profile
  }
}

export const updateProfile = async (payload: UserDto): Promise<UserProfile> => {
  try {
    const raw = await requestJson<unknown>('/user/profile', {
      method: 'PUT',
      withAuth: true,
      body: JSON.stringify(payload),
    })
    return normalizeProfile(raw)
  } catch (error) {
    if (!isApiOfflineError(error)) throw error
    const userId = getLocalSessionUserId()
    const profiles = readLocalProfiles()
    const current = profiles.find((candidate) => candidate.id === userId)
    if (!current) {
      throw new Error('Профиль пользователя не найден')
    }

    const updated: UserProfile = {
      ...current,
      email: payload.email,
      name: payload.name ?? current.name,
      pomodoroSettings: {
        workInterval: payload.workInterval ?? current.pomodoroSettings.workInterval,
        breakInterval: payload.breakInterval ?? current.pomodoroSettings.breakInterval,
        intervalCount: payload.intervalCount ?? current.pomodoroSettings.intervalCount,
      },
    }

    saveLocalProfiles(
      profiles.map((candidate) => (candidate.id === userId ? updated : candidate)),
    )
    return updated
  }
}
