import { createContext, useContext } from 'react'
import type { Point } from '@/store/types'

export type BoardView = {
  land: boolean
  /** CSS px per pitch unit. */
  scale: number
  /** Client (screen) point to portrait pitch units. */
  clientToPitch: (clientX: number, clientY: number) => Point
}

export const BoardViewContext = createContext<BoardView>({
  land: false,
  scale: 0.5,
  clientToPitch: () => ({ x: 0, y: 0 }),
})

export const useBoardView = () => useContext(BoardViewContext)
