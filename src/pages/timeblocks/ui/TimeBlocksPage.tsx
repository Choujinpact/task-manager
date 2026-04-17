import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
	createTimeBlock,
	getTimeBlocks,
	removeTimeBlock,
} from '../../../shared/api/timeblocksApi'

type TimeBlock = {
	id: string
	title: string
	duration: number
	color?: string
	order?: number
	startAt: string
	endAt: string
}

const TIMEBLOCKS_STORAGE_KEY = 'red_planner_timeblocks'

const toIso = (dateValue: string, timeValue: string): string => {
	const local = new Date(`${dateValue}T${timeValue}:00`)
	return local.toISOString()
}

const toTimeLabel = (iso: string): string => {
	const date = new Date(iso)
	return date.toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	})
}

const todayIsoDate = (): string => {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

const calculateDuration = (startAt: string, endAt: string): number => {
	return Math.round(
		(new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000,
	)
}

interface TimeBlocksPageProps {
	notificationsEnabled: boolean
}

const NOTIFY_BEFORE_MINUTES = 5

export const TimeBlocksPage: React.FC<TimeBlocksPageProps> = ({
	notificationsEnabled,
}) => {
	const notifiedIdsRef = useRef<Set<string>>(new Set())
	const [blocks, setBlocks] = useState<TimeBlock[]>(() => {
		const raw = window.localStorage.getItem(TIMEBLOCKS_STORAGE_KEY)
		if (!raw) return []
		try {
			const parsed = JSON.parse(raw) as TimeBlock[]
			if (Array.isArray(parsed)) return parsed
			return []
		} catch {
			return []
		}
	})
	const [title, setTitle] = useState('')
	const [date, setDate] = useState(todayIsoDate())
	const [start, setStart] = useState('')
	const [end, setEnd] = useState('')

	const sortedBlocks = useMemo(
		() =>
			[...blocks].sort(
				(a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
			),
		[blocks],
	)

	useEffect(() => {
		window.localStorage.setItem(TIMEBLOCKS_STORAGE_KEY, JSON.stringify(blocks))
	}, [blocks])

	useEffect(() => {
		const loadTimeBlocks = async () => {
			try {
				const remoteBlocks = await getTimeBlocks()
				if (remoteBlocks && remoteBlocks.length > 0) {
					setBlocks(
						remoteBlocks.map(block => {
							const startAt = new Date().toISOString()
							const endAt = new Date(
								Date.now() + block.duration * 60000,
							).toISOString()
							return {
								id: String(block.id),
								title: block.name,
								duration: block.duration,
								color: block.color,
								order: block.order,
								startAt: startAt,
								endAt: endAt,
							}
						}),
					)
				} else {
					setBlocks([])
				}
			} catch {
				// keep local data while backend is unavailable
			}
		}
		void loadTimeBlocks()
	}, [])

	useEffect(() => {
		if (!notificationsEnabled) return
		if (!('Notification' in window)) return
		if (Notification.permission === 'default') {
			void Notification.requestPermission()
		}
	}, [notificationsEnabled])

	useEffect(() => {
		if (!notificationsEnabled) return

		const intervalId = window.setInterval(() => {
			const now = Date.now()

			sortedBlocks.forEach(block => {
				if (notifiedIdsRef.current.has(block.id)) return

				const startTs = new Date(block.startAt).getTime()
				const notifyTs = startTs - NOTIFY_BEFORE_MINUTES * 60 * 1000
				const isNotificationWindow = now >= notifyTs && now <= startTs

				if (!isNotificationWindow) return

				const bodyText = `Скоро начнется: "${block.title}" в ${toTimeLabel(block.startAt)}`
				if ('Notification' in window && Notification.permission === 'granted') {
					new Notification('RED planner · Напоминание', {
						body: bodyText,
					})
				} else {
					alert(bodyText)
				}

				notifiedIdsRef.current.add(block.id)
			})
		}, 30000)

		return () => window.clearInterval(intervalId)
	}, [notificationsEnabled, sortedBlocks])

	const handleAddBlock = () => {
		const trimmedTitle = title.trim()
		if (!trimmedTitle || !start || !end) {
			alert('Заполните название и время начала/конца')
			return
		}

		const startAt = toIso(date, start)
		const endAt = toIso(date, end)

		if (new Date(startAt).getTime() >= new Date(endAt).getTime()) {
			alert('Время начала должно быть меньше времени окончания')
			return
		}

		const duration = calculateDuration(startAt, endAt)

		const newBlock: TimeBlock = {
			id: String(Date.now()),
			title: trimmedTitle,
			duration: duration,
			startAt: startAt,
			endAt: endAt,
		}

		setBlocks(prev => [...prev, newBlock])
		setTitle('')
		setStart('')
		setEnd('')
		setDate(todayIsoDate())

		const syncTimeBlock = async () => {
			try {
				const created = await createTimeBlock({
					title: trimmedTitle,
					startDateTime: startAt,
					endDateTime: endAt,
				})
				setBlocks(prev =>
					prev.map(block =>
						block.id === newBlock.id
							? {
									id: String(created.id),
									title: created.name,
									duration: created.duration,
									color: created.color,
									order: created.order,
									startAt: startAt,
									endAt: endAt,
								}
							: block,
					),
				)
			} catch {
				// keep optimistic local block if backend is unavailable
			}
		}
		void syncTimeBlock()
	}

	const handleDeleteBlock = (id: string) => {
		setBlocks(prev => prev.filter(block => block.id !== id))
		notifiedIdsRef.current.delete(id)

		const syncDelete = async () => {
			try {
				await removeTimeBlock(id)
			} catch {
				// ignore API failure and keep local result
			}
		}
		void syncDelete()
	}

	const handleClearAll = () => {
		if (blocks.length === 0) return
		const confirmed = window.confirm('Удалить все временные блоки?')
		if (!confirmed) return
		setBlocks([])
		notifiedIdsRef.current.clear()
	}

	return (
		<div className='page'>
			<h2 className='page-title'>⏳ Временные блоки</h2>

			<div className='block-list'>
				{sortedBlocks.map(b => (
					<div className='time-block' key={b.id}>
						<span>{b.title}</span>
						<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
							<span className='block-time'>
								{toTimeLabel(b.startAt)}–{toTimeLabel(b.endAt)}
							</span>
							<button
								className='delete-task'
								title='Удалить блок'
								onClick={() => handleDeleteBlock(b.id)}
							>
								✕
							</button>
						</div>
					</div>
				))}
			</div>

			<div className='add-task' style={{ marginTop: 24 }}>
				<input
					type='text'
					className='task-input'
					placeholder='Название блока'
					value={title}
					onChange={e => setTitle(e.target.value)}
				/>
			</div>

			<div className='add-task'>
				<input
					type='date'
					className='task-input'
					value={date}
					onChange={e => setDate(e.target.value)}
				/>
				<input
					type='time'
					className='task-input'
					value={start}
					onChange={e => setStart(e.target.value)}
				/>
				<input
					type='time'
					className='task-input'
					value={end}
					onChange={e => setEnd(e.target.value)}
				/>
				<button className='btn-primary' onClick={handleAddBlock}>
					➕ Добавить блок
				</button>
				<button className='add-block-btn' onClick={handleClearAll}>
					🗑 Очистить все
				</button>
			</div>
		</div>
	)
}
