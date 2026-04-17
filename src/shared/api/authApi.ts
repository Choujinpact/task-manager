import { ApiError, requestJson, setAccessToken } from './http'

export type AuthDto = {
	email: string
	password: string
}

export type AuthUser = {
	id: string
	email: string
	name?: string
}

export type AuthResponse = {
	accessToken: string
	user: AuthUser
}

type LocalAuthUserRecord = {
	id: string
	email: string
	password: string
	name?: string
}

type LocalUserProfileRecord = {
	id: string
	email: string
	name: string | null
	pomodoroSettings: {
		workInterval: number
		breakInterval: number
		intervalCount: number
	}
}

const LOCAL_USERS_KEY = 'red_planner_local_auth_users'
const LOCAL_SESSION_USER_ID_KEY = 'red_planner_local_auth_session_user_id'
const LOCAL_PROFILES_KEY = 'red_planner_local_auth_profiles'

const isApiOfflineError = (error: unknown): boolean => {
	if (
		error instanceof Error &&
		error.message.includes('Не удалось подключиться к API')
	) {
		return true
	}

	if (
		error instanceof ApiError &&
		[502, 503, 504].indexOf(error.status) !== -1
	) {
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

const readLocalUsers = (): LocalAuthUserRecord[] => {
	try {
		const raw = window.localStorage.getItem(LOCAL_USERS_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw) as LocalAuthUserRecord[]
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

const saveLocalUsers = (users: LocalAuthUserRecord[]) => {
	window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
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

const setLocalSessionUserId = (userId: string | null) => {
	if (userId) {
		window.localStorage.setItem(LOCAL_SESSION_USER_ID_KEY, userId)
		return
	}
	window.localStorage.removeItem(LOCAL_SESSION_USER_ID_KEY)
}

const buildOfflineAuthResponse = (user: LocalAuthUserRecord): AuthResponse => {
	const token = `offline-token-${user.id}`
	setAccessToken(token) // Эта функция теперь сохранит и в localStorage
	setLocalSessionUserId(user.id)
	return {
		accessToken: token,
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
		},
	}
}

const handleAuthSuccess = (payload: AuthResponse): AuthResponse => {
	setAccessToken(payload.accessToken) // Эта функция теперь сохранит и в localStorage
	return payload
}

export const login = async (payload: AuthDto): Promise<AuthResponse> => {
	try {
		const response = await requestJson<AuthResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(payload),
			withAuth: false, // Логин не требует токена
		})
		return handleAuthSuccess(response)
	} catch (error) {
		if (!isApiOfflineError(error)) throw error
		const users = readLocalUsers()
		const user = users.find(
			candidate =>
				candidate.email.toLowerCase() === payload.email.trim().toLowerCase(),
		)
		if (!user || user.password !== payload.password) {
			throw new Error('Неверный email или пароль')
		}
		return buildOfflineAuthResponse(user)
	}
}

export const register = async (payload: AuthDto): Promise<AuthResponse> => {
	try {
		const response = await requestJson<AuthResponse>('/auth/register', {
			method: 'POST',
			body: JSON.stringify(payload),
			withAuth: false, // Регистрация не требует токена
		})
		return handleAuthSuccess(response)
	} catch (error) {
		if (!isApiOfflineError(error)) throw error
		const normalizedEmail = payload.email.trim().toLowerCase()
		const users = readLocalUsers()
		const exists = users.some(
			user => user.email.toLowerCase() === normalizedEmail,
		)
		if (exists) {
			throw new Error('Пользователь с таким email уже существует')
		}

		const user: LocalAuthUserRecord = {
			id: String(Date.now()),
			email: normalizedEmail,
			password: payload.password,
		}
		saveLocalUsers([...users, user])

		const profiles = readLocalProfiles()
		saveLocalProfiles([
			...profiles,
			{
				id: user.id,
				email: user.email,
				name: null,
				pomodoroSettings: {
					workInterval: 25,
					breakInterval: 5,
					intervalCount: 4,
				},
			},
		])

		return buildOfflineAuthResponse(user)
	}
}

export const loginByRefreshToken = async (): Promise<AuthResponse> => {
	try {
		const response = await requestJson<AuthResponse>(
			'/auth/login/access-token',
			{
				method: 'POST',
				withAuth: false, // Обновление токена не требует токена (использует cookie)
			},
		)
		return handleAuthSuccess(response)
	} catch (error) {
		if (!isApiOfflineError(error)) throw error
		const userId = window.localStorage.getItem(LOCAL_SESSION_USER_ID_KEY)
		if (!userId) {
			throw new Error('Сессия не найдена')
		}
		const users = readLocalUsers()
		const user = users.find(candidate => candidate.id === userId)
		if (!user) {
			throw new Error('Сессия не найдена')
		}
		return buildOfflineAuthResponse(user)
	}
}

export const logout = async (): Promise<boolean> => {
	try {
		const result = await requestJson<boolean>('/auth/logout', {
			method: 'POST',
			withAuth: true,
		})
		setAccessToken(null) // Очищает и память, и localStorage
		setLocalSessionUserId(null)
		return result
	} catch (error) {
		if (!isApiOfflineError(error)) throw error
		setAccessToken(null) // Очищает и память, и localStorage
		setLocalSessionUserId(null)
		return true
	}
}
