import create from 'zustand'

export type BoardState = {
  currentBoard:any
  setCurrentBoard: (board: any) => void
}

export const useBoardState = create<BoardState>(set => ({
  currentBoard:undefined,
  setCurrentBoard: (board: any) => set({currentBoard: board}),

}))

