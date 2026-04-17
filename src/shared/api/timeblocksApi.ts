import { requestJson } from './http'

export type TimeBlockApiModel = {
  id: string
  title: string
  startDateTime: string
  endDateTime: string
}

type TimeBlockDto = {
  id: string
  name: string
  duration: number
  createdAt: string
}

const mapFromDto = (block: TimeBlockDto): TimeBlockApiModel => {
  const start = new Date(block.createdAt)
  const end = new Date(start.getTime() + block.duration * 60 * 1000)
  return {
    id: block.id,
    title: block.name,
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
  }
}

export const getTimeBlocks = async (): Promise<TimeBlockApiModel[]> => {
  const blocks = await requestJson<TimeBlockDto[]>('/user/time-blocks')
  return blocks.map(mapFromDto)
}

export const createTimeBlock = async (payload: {
  title: string
  startDateTime: string
  endDateTime: string
}): Promise<TimeBlockApiModel> => {
  const start = new Date(payload.startDateTime)
  const end = new Date(payload.endDateTime)
  const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000))

  const created = await requestJson<TimeBlockDto>('/user/time-blocks', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.title,
      duration,
    }),
  })
  return mapFromDto(created)
}

export const removeTimeBlock = async (id: string | number): Promise<void> => {
  await requestJson(`/user/time-blocks/${id}`, {
    method: 'DELETE',
  })
}

