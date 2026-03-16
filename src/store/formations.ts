import type { Formation, FormationName, FormationPosition } from './types'

const pos433: FormationPosition[] = [
  { position: 'GK',  x: 340, y: 960 },
  { position: 'RB',  x: 560, y: 800 },
  { position: 'RCB', x: 430, y: 820 },
  { position: 'LCB', x: 250, y: 820 },
  { position: 'LB',  x: 120, y: 800 },
  { position: 'RCM', x: 480, y: 600 },
  { position: 'CM',  x: 340, y: 570 },
  { position: 'LCM', x: 200, y: 600 },
  { position: 'RW',  x: 560, y: 380 },
  { position: 'ST',  x: 340, y: 340 },
  { position: 'LW',  x: 120, y: 380 },
]

const pos442: FormationPosition[] = [
  { position: 'GK',  x: 340, y: 960 },
  { position: 'RB',  x: 560, y: 800 },
  { position: 'RCB', x: 430, y: 820 },
  { position: 'LCB', x: 250, y: 820 },
  { position: 'LB',  x: 120, y: 800 },
  { position: 'RW',  x: 560, y: 590 },
  { position: 'RCM', x: 430, y: 570 },
  { position: 'LCM', x: 250, y: 570 },
  { position: 'LW',  x: 120, y: 590 },
  { position: 'ST',  x: 430, y: 360 },
  { position: 'CF',  x: 250, y: 360 },
]

const pos4231: FormationPosition[] = [
  { position: 'GK',  x: 340, y: 960 },
  { position: 'RB',  x: 560, y: 800 },
  { position: 'RCB', x: 430, y: 820 },
  { position: 'LCB', x: 250, y: 820 },
  { position: 'LB',  x: 120, y: 800 },
  { position: 'CDM', x: 430, y: 640 },
  { position: 'DM',  x: 250, y: 640 },
  { position: 'RAM', x: 500, y: 460 },
  { position: 'CAM', x: 340, y: 440 },
  { position: 'LAM', x: 180, y: 460 },
  { position: 'ST',  x: 340, y: 300 },
]

const pos352: FormationPosition[] = [
  { position: 'GK',  x: 340, y: 960 },
  { position: 'RCB', x: 510, y: 820 },
  { position: 'CB',  x: 340, y: 840 },
  { position: 'LCB', x: 170, y: 820 },
  { position: 'RWB', x: 580, y: 640 },
  { position: 'RCM', x: 460, y: 600 },
  { position: 'CM',  x: 340, y: 580 },
  { position: 'LCM', x: 220, y: 600 },
  { position: 'LWB', x: 100, y: 640 },
  { position: 'ST',  x: 430, y: 360 },
  { position: 'CF',  x: 250, y: 360 },
]

const pos532: FormationPosition[] = [
  { position: 'GK',  x: 340, y: 960 },
  { position: 'RWB', x: 580, y: 780 },
  { position: 'RCB', x: 480, y: 820 },
  { position: 'CB',  x: 340, y: 840 },
  { position: 'LCB', x: 200, y: 820 },
  { position: 'LWB', x: 100, y: 780 },
  { position: 'RCM', x: 460, y: 590 },
  { position: 'CM',  x: 340, y: 570 },
  { position: 'LCM', x: 220, y: 590 },
  { position: 'ST',  x: 430, y: 360 },
  { position: 'CF',  x: 250, y: 360 },
]

const pos451: FormationPosition[] = [
  { position: 'GK',  x: 340, y: 960 },
  { position: 'RB',  x: 560, y: 800 },
  { position: 'RCB', x: 430, y: 820 },
  { position: 'LCB', x: 250, y: 820 },
  { position: 'LB',  x: 120, y: 800 },
  { position: 'RW',  x: 560, y: 570 },
  { position: 'RCM', x: 460, y: 570 },
  { position: 'CM',  x: 340, y: 555 },
  { position: 'LCM', x: 220, y: 570 },
  { position: 'LW',  x: 120, y: 570 },
  { position: 'ST',  x: 340, y: 310 },
]

export const FORMATIONS: Record<FormationName, FormationPosition[]> = {
  '4-3-3':   pos433,
  '4-4-2':   pos442,
  '4-2-3-1': pos4231,
  '3-5-2':   pos352,
  '5-3-2':   pos532,
  '4-5-1':   pos451,
}

export const formations: Formation[] = Object.entries(FORMATIONS).map(
  ([name, positions]) => ({ name: name as FormationName, positions })
)
