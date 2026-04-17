const API_BASE_URL = 'http://localhost:5000/api'

export const requestJson = async <T>(
	path: string,
	init?: RequestInit,
): Promise<T> => {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers ?? {}),
		},
		credentials: 'include',
		...init,
	})

	if (!response.ok) {
		throw new Error(`API request failed: ${response.status}`)
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
