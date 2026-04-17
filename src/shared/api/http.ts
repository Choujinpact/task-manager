const API_BASE_URL = '/api'

let accessToken: string | null = null

// Загружаем токен из localStorage при старте
const loadTokenFromStorage = () => {
	const storedToken = localStorage.getItem('accessToken')
	if (storedToken) {
		accessToken = storedToken
	}
}

loadTokenFromStorage()

export class ApiError extends Error {
	readonly status: number

	constructor(status: number, message: string) {
		super(message)
		this.name = 'ApiError'
		this.status = status
	}
}

export const setAccessToken = (token: string | null) => {
	accessToken = token
	if (token) {
		localStorage.setItem('accessToken', token)
	} else {
		localStorage.removeItem('accessToken')
	}
}

export const getAccessToken = () => {
	if (!accessToken) {
		loadTokenFromStorage()
	}
	return accessToken
}

export const requestJson = async <T>(
	path: string,
	init?: RequestInit & { withAuth?: boolean },
): Promise<T> => {
	const headers = new Headers(init?.headers)
	if (!headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json')
	}

	if (init?.withAuth) {
		const token = getAccessToken()
		if (token) {
			headers.set('Authorization', `Bearer ${token}`)
		}
	}

	let response: Response
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			...init,
			headers,
			credentials: 'include',
		})
	} catch {
		throw new Error(
			'Не удалось подключиться к API. Проверь, что backend запущен на http://localhost:3001',
		)
	}

	if (!response.ok) {
		const errorText = await response.text()
		throw new ApiError(
			response.status,
			errorText || `API request failed: ${response.status}`,
		)
	}

	if (response.status === 204) {
		return undefined as T
	}

	const text = await response.text()
	if (!text) {
		return undefined as T
	}

	return JSON.parse(text) as T
}
