import { memo } from 'react'
import { PITCH_L, PITCH_W } from '@/utils/geometry'

/** Floodlit grass in 14 mown bands with chalk markings, in portrait pitch units (10 = 1 m). */
function box(y0: number, dir: 1 | -1) {
  const y1 = y0 + dir * 165, y2 = y0 + dir * 55, ps = y0 + dir * 110
  return (
    <g key={y0}>
      <path d={`M138.4 ${y0}V${y1}H541.6V${y0}`} />
      <path d={`M248.4 ${y0}V${y2}H431.6V${y0}`} />
      <circle className="spot" cx={340} cy={ps} r={3} />
      <path d={`M266.9 ${y1}A91.5 91.5 0 0 ${dir > 0 ? 0 : 1} 413.1 ${y1}`} />
      <path className="goal" d={`M303.4 ${y0}V${y0 - dir * 20}H376.6V${y0}`} />
    </g>
  )
}

const PitchField = memo(function PitchField({ margin }: { margin: number }) {
  return (
    <g className="field">
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} className={'band' + (i % 2 ? ' b2' : '')} x={0} y={i * 75} width={PITCH_W} height={75} />
      ))}
      <rect x={-margin} y={-margin} width={PITCH_W + 2 * margin} height={PITCH_L + 2 * margin} fill="url(#flood)" />
      <g className="lines">
        <rect x={0} y={0} width={PITCH_W} height={PITCH_L} />
        <path d={`M0 525H${PITCH_W}`} />
        <circle cx={340} cy={525} r={91.5} />
        <circle className="spot" cx={340} cy={525} r={3.5} />
        {box(0, 1)}
        {box(PITCH_L, -1)}
        <path d="M10 0A10 10 0 0 1 0 10M670 0A10 10 0 0 0 680 10M0 1040A10 10 0 0 1 10 1050M680 1040A10 10 0 0 0 670 1050" />
      </g>
    </g>
  )
})

export default PitchField
