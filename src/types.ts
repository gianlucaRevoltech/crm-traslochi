export type Handler = 'io' | 'ditta'
export type BoxStatus = 'da_fare' | 'fatto'

export interface Box {
  id: string
  number: number
  label: string
  handler: Handler
  room: string
  contents: string[]
  fragile: boolean
  notes: string
  status: BoxStatus
  createdAt: number
  updatedAt: number
}

export interface AppData {
  version: number
  moveName: string
  boxes: Box[]
}