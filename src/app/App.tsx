import React, { useEffect, useState } from 'react'
import '../app/styles/index.css'
import { AuthPage } from '../pages/auth/ui/AuthPage'
import { PomodoroPage } from '../pages/pomodoro/ui/PomodoroPage'
import { SettingsPage } from '../pages/settings/ui/SettingsPage'
import { TasksPage } from '../pages/tasks/ui/TasksPage'
import { TimeBlocksPage } from '../pages/timeblocks/ui/TimeBlocksPage'
import {
	login,
	loginByRefreshToken,
	logout,
	register,
	type AuthDto,
	type AuthUser,
} from '../shared/api/authApi'
import {
	getProfile,
	updateProfile,
	type UserProfile,
} from '../shared/api/userApi'
import { MainLayout } from '../widgets/layout/ui/MainLayout'

export type PageId = 'tasks' | 'pomodoro' | 'timeblocks' | 'settings'

const SETTINGS_STORAGE_KEY = 'red_planner_settings'

export const App: React.FC = () => {
	const [page, setPage] = useState<PageId>('tasks')
	const [isSessionLoading, setIsSessionLoading] = useState(true)
	const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
	const [authUser, setAuthUser] = useState<AuthUser | null>(null)
	const [profile, setProfile] = useState<UserProfile | null>(null)

	const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
		() => {
			const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
			if (!raw) return true
			try {
				const parsed = JSON.parse(raw) as { notificationsEnabled?: boolean }
				return parsed.notificationsEnabled ?? true
			} catch {
				return true
			}
		},
	)

	useEffect(() => {
		window.localStorage.setItem(
			SETTINGS_STORAGE_KEY,
			JSON.stringify({ notificationsEnabled }),
		)
	}, [notificationsEnabled])

	useEffect(() => {
		const restoreSession = async () => {
			setIsSessionLoading(true)
			try {
				const authData = await loginByRefreshToken()
				setAuthUser(authData.user)
				const currentProfile = await getProfile()
				setProfile(currentProfile)
			} catch {
				setAuthUser(null)
				setProfile(null)
			} finally {
				setIsSessionLoading(false)
			}
		}
		void restoreSession()
	}, [])

	const handleAuth = async (
		method: (payload: AuthDto) => Promise<{ user: AuthUser }>,
		payload: AuthDto,
	) => {
		setIsAuthSubmitting(true)
		try {
			const authData = await method(payload)
			setAuthUser(authData.user)
			const currentProfile = await getProfile()
			setProfile(currentProfile)
			setPage('tasks')
		} finally {
			setIsAuthSubmitting(false)
		}
	}

	const handleLogout = async () => {
		try {
			await logout()
		} finally {
			setAuthUser(null)
			setProfile(null)
		}
	}

	const handleSaveSettings = async (options: {
		notificationsEnabled: boolean
		email: string
		password: string
		name?: string
		workInterval?: number
		breakInterval?: number
		intervalCount?: number
	}) => {
		await updateProfile({
			email: options.email,
			password: options.password,
			name: options.name,
			workInterval: options.workInterval,
			breakInterval: options.breakInterval,
			intervalCount: options.intervalCount,
		})

		// После PUT забираем актуальный профиль в ожидаемом формате
		const freshProfile = await getProfile()
		setNotificationsEnabled(options.notificationsEnabled)
		setProfile(freshProfile)
		setAuthUser(prev =>
			prev
				? {
						...prev,
						email: freshProfile.email,
						name: freshProfile.name ?? undefined,
					}
				: prev,
		)
	}

	if (isSessionLoading) {
		return <div className='auth-shell'>Проверка сессии...</div>
	}

	if (!authUser || !profile) {
		return (
			<AuthPage
				isLoading={isAuthSubmitting}
				onLogin={payload => handleAuth(login, payload)}
				onRegister={payload => handleAuth(register, payload)}
			/>
		)
	}

	const pomodoroSettings = profile.pomodoroSettings ?? {
		workInterval: 25,
		breakInterval: 5,
		intervalCount: 4,
	}

	return (
		<MainLayout
			currentPage={page}
			onChangePage={setPage}
			userEmail={authUser.email}
			onLogout={() => void handleLogout()}
		>
			{page === 'tasks' && <TasksPage />}
			{page === 'pomodoro' && (
				<PomodoroPage
					length={pomodoroSettings.workInterval}
					notificationsEnabled={notificationsEnabled}
				/>
			)}
			{page === 'timeblocks' && (
				<TimeBlocksPage notificationsEnabled={notificationsEnabled} />
			)}
			{page === 'settings' && (
				<SettingsPage
					notificationsEnabled={notificationsEnabled}
					email={profile.email}
					name={profile.name ?? ''}
					workInterval={pomodoroSettings.workInterval}
					breakInterval={pomodoroSettings.breakInterval}
					intervalCount={pomodoroSettings.intervalCount}
					onSave={handleSaveSettings}
				/>
			)}
		</MainLayout>
	)
}
