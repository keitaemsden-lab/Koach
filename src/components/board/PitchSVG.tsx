import { memo } from 'react'

interface PitchSVGProps {
  orientation?: 'portrait' | 'landscape'
}

const PitchSVG = memo(function PitchSVG({ orientation = 'portrait' }: PitchSVGProps) {
  const L = 10, T = 10, R = 670, B = 1040
  const W = R - L   // 660
  const H = B - T   // 1030

  // Penalty area: 403 wide x 165 deep, centred
  const paW = 403, paD = 165
  const paX = L + (W - paW) / 2  // 138.5

  // Goal area: 183 wide x 55 deep, centred
  const gaW = 183, gaD = 55
  const gaX = L + (W - gaW) / 2  // 248.5

  // Goals: 73 wide x 15 deep, centred
  const goalW = 73, goalD = 15
  const goalX = L + (W - goalW) / 2  // 303.5

  // Centre
  const cx = 340, cy = 525

  // Penalty spots
  const psYt = T + 95   // 105
  const psYb = B - 95   // 945

  // Penalty arc (D)
  const arcR = 91.5
  const arcDYt = T + paD - psYt  // 175 - 105 = 70
  const arcDXt = Math.sqrt(arcR * arcR - arcDYt * arcDYt)  // ≈ 58.9
  const arcDYb = psYb - (B - paD)  // 945 - 875 = 70
  const arcDXb = Math.sqrt(arcR * arcR - arcDYb * arcDYb)

  const line = { stroke: 'var(--pitch-lines)', strokeWidth: 2, fill: 'none' }

  const isLandscape = orientation === 'landscape'

  return (
    <g transform={isLandscape ? 'translate(0, 680) rotate(-90)' : undefined}>
      <defs>
        <pattern id="pitch-stripes" x="0" y="0" width="680" height="64" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="680" height="32" fill="var(--pitch-fill)" />
          <rect x="0" y="32" width="680" height="32" fill="var(--pitch-alt)" />
        </pattern>
      </defs>

      {/* Background */}
      <rect x={L} y={T} width={W} height={H} fill="url(#pitch-stripes)" />

      {/* Outer border */}
      <rect x={L} y={T} width={W} height={H} {...line} />

      {/* Halfway line */}
      <line x1={L} y1={cy} x2={R} y2={cy} {...line} />

      {/* Centre circle */}
      <circle cx={cx} cy={cy} r={91.5} {...line} />
      <circle cx={cx} cy={cy} r={4} fill="var(--pitch-lines)" />

      {/* Penalty areas */}
      <rect x={paX} y={T} width={paW} height={paD} {...line} />
      <rect x={paX} y={B - paD} width={paW} height={paD} {...line} />

      {/* Goal areas */}
      <rect x={gaX} y={T} width={gaW} height={gaD} {...line} />
      <rect x={gaX} y={B - gaD} width={gaW} height={gaD} {...line} />

      {/* Penalty spots */}
      <circle cx={cx} cy={psYt} r={4} fill="var(--pitch-lines)" />
      <circle cx={cx} cy={psYb} r={4} fill="var(--pitch-lines)" />

      {/* Penalty arcs (D) */}
      <path d={`M ${cx - arcDXt} ${T + paD} A ${arcR} ${arcR} 0 0 1 ${cx + arcDXt} ${T + paD}`} {...line} />
      <path d={`M ${cx + arcDXb} ${B - paD} A ${arcR} ${arcR} 0 0 1 ${cx - arcDXb} ${B - paD}`} {...line} />

      {/* Corner arcs */}
      <path d={`M ${L} ${T + 10} A 10 10 0 0 1 ${L + 10} ${T}`} {...line} />
      <path d={`M ${R - 10} ${T} A 10 10 0 0 1 ${R} ${T + 10}`} {...line} />
      <path d={`M ${R} ${B - 10} A 10 10 0 0 1 ${R - 10} ${B}`} {...line} />
      <path d={`M ${L + 10} ${B} A 10 10 0 0 1 ${L} ${B - 10}`} {...line} />

      {/* Goals */}
      <polyline points={`${goalX},${T} ${goalX},${T - goalD} ${goalX + goalW},${T - goalD} ${goalX + goalW},${T}`} {...line} />
      <polyline points={`${goalX},${B} ${goalX},${B + goalD} ${goalX + goalW},${B + goalD} ${goalX + goalW},${B}`} {...line} />
    </g>
  )
})

export default PitchSVG
