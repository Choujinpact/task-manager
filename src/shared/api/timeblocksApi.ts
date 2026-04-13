import { requestJson } from './http'

export type TimeBlockApiModel = {
  id: number
  title: string
  startDateTime: string
  endDateTime: string
}

export const getTimeBlocks = async (): Promise<TimeBlockApiModel[]> => {
  return requestJson<TimeBlockApiModel[]>('/timeblocks')
}

export const createTimeBlock = async (payload: {
  title: string
  startDateTime: string
  endDateTime: string
}): Promise<TimeBlockApiModel> => {
  return requestJson<TimeBlockApiModel>('/timeblocks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const removeTimeBlock = async (id: number): Promise<void> => {
  await requestJson(`/timeblocks/${id}`, {
    method: 'DELETE',
  })
}

