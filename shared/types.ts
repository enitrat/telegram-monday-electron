export type MondayBoard = {
  name: string
  id: string
  description: string | null
  groups: MondayGroup[]
  columns: MondayColumn[]
  items: any
}

export type MondayGroup = {
  id: string
  title: string
}

export type MondayColumn = {
  id: string
  title: string
}

export type CustomDialog = {
  date: number
  lastMsgDate: number | undefined
  link: string
  lastMsg: string | undefined
  id: { value: bigInt.BigInteger }
  title: string
  type:
    | 'UserEmpty'
    | 'User'
    | 'Chat'
    | 'Channel'
    | 'ChatEmpty'
    | 'ChatForbidden'
    | 'ChannelForbidden'
}

export type CustomParticipant = {
  firstName: string
  lastName: string
  id: { value: BigInt }
  username: string
}

export interface CustomFolder {
  title: string
  peerIds: number[]
  id: number
}
