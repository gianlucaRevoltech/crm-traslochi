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
  // Tombstone per la sincronizzazione: quando deleted=true il pacco e' rimosso
  // dall'UI ma resta nei dati per poter propagare la cancellazione agli altri
  // dispositivi (merge last-write-wins su updatedAt).
  deleted?: boolean
}

export interface AppData {
  version: number
  moveName: string
  boxes: Box[]
  updatedAt: number
}