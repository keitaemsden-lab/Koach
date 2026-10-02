import type { Arrow, FormationName, Player, PositionLabel } from './types'
import { FORMATIONS } from './formations'
import { PITCH_L, PITCH_W } from '@/utils/geometry'

/** Squad numbers by 4-3-3 slot: GK RB RCB LCB LB RCM CM LCM RW ST LW. */
export const SLOT_NUMBERS = [1, 2, 5, 4, 3, 8, 6, 10, 7, 9, 11]

export const DEFAULT_HOME_KIT = '#E8442E'
export const DEFAULT_AWAY_KIT = '#EEF2EA'

/** Home stands in the bottom half (own goal at y = 1050); away is the mirror image. */
export function slotPoint(team: 'home' | 'away', formation: FormationName, i: number, ownHalf = false) {
  const fp = FORMATIONS[formation][i]
  let y = fp.y
  // squeeze [300, 960] into [540, 960] so the shape stays in its own half
  if (ownHalf) y = 540 + ((y - 300) / 660) * 420
  return team === 'home' ? { x: fp.x, y } : { x: PITCH_W - fp.x, y: PITCH_L - y }
}

export function squad(team: 'home' | 'away', formation: FormationName, names: string[] = []): Player[] {
  return FORMATIONS[formation].map((fp, i) => ({
    id: crypto.randomUUID(),
    team,
    position: fp.position as PositionLabel,
    name: names[i] ?? '',
    number: SLOT_NUMBERS[i],
    ...slotPoint(team, formation, i),
  }))
}

/** The blank board Reset returns to: 4-3-3 against 4-3-3, no arrows. */
export function blankPlayers(): Player[] {
  return [...squad('home', '4-3-3'), ...squad('away', '4-3-3')]
}

const DEMO_NAMES = ['Mason', 'Tui', 'Harper', 'Okafor', 'Liam', 'Riley', 'Ari', 'Kenji', 'Jack', 'Noah', 'Zane']

/** First visit only: a worked move so Play the move has something to play. */
export function demoBoard() {
  const home = squad('home', '4-3-3', DEMO_NAMES)
  const away = squad('away', '4-4-2')
  const liam = home[4], kenji = home[7], noah = home[9], awayStriker = away[9]
  const mk = (p: Player, a: Pick<Arrow, 'type' | 'team' | 'end' | 'control'>, colour: string): Arrow => ({
    id: crypto.randomUUID(),
    style: 'curved',
    start: { x: p.x, y: p.y },
    fromId: p.id,
    teamColour: colour,
    ...a,
  })
  const arrows: Arrow[] = [
    mk(liam, { type: 'run', team: 'home', end: { x: 70, y: 450 }, control: { x: 25, y: 630 } }, DEFAULT_HOME_KIT),
    mk(kenji, { type: 'pass', team: 'home', end: { x: 80, y: 475 } }, DEFAULT_HOME_KIT),
    mk(noah, { type: 'press', team: 'home', end: { x: 268, y: 262 } }, DEFAULT_HOME_KIT),
    mk(awayStriker, { type: 'run', team: 'away', end: { x: 180, y: 820 }, control: { x: 260, y: 780 } }, DEFAULT_AWAY_KIT),
  ]
  return {
    players: [...home, ...away],
    arrows,
    title: 'U14 Div 1: build-up against a 4-4-2 block',
    notes: 'Win it back inside 6 seconds. Liam overlaps when Zane comes inside; Kenji plays him in behind. Noah presses their right centre back to force it long.',
    activeFormation: '4-3-3' as FormationName,
    awayFormation: '4-4-2' as FormationName,
  }
}
