/* Telestrator glyphs drawn for Koach (square caps, 1.6 stroke), not a generic icon set. */
const S = { viewBox: '0 0 24 24', 'aria-hidden': true } as const

export const MoveIcon = () => <svg {...S}><path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" /></svg>
export const DrawIcon = () => <svg {...S}><path d="M4 20c4-1 6-5 9-8s5-5 7-8M15 4h5v5" /></svg>
export const PlayIcon = () => <svg {...S}><path d="M7 4l13 8-13 8z" /></svg>
export const StopIcon = () => <svg {...S}><path d="M6 6h12v12H6z" /></svg>
export const BackIcon = () => <svg {...S}><path d="M20 12H5M11 6l-6 6 6 6" /></svg>
export const ShapeIcon = () => <svg {...S}><path d="M5 5h3v3H5zM10.5 5h3v3h-3zM16 5h3v3h-3zM7.5 11h3v3h-3zM13.5 11h3v3h-3zM10.5 17h3v3h-3z" /></svg>
export const UndoIcon = () => <svg {...S}><path d="M9 7H4V2M4 7c3-3 6-4 9-4a8 8 0 1 1-7.5 10.5" /></svg>
export const RedoIcon = () => <svg {...S}><path d="M15 7h5V2M20 7c-3-3-6-4-9-4a8 8 0 1 0 7.5 10.5" /></svg>
export const MoreIcon = () => <svg {...S}><path d="M4 7h16M4 12h16M4 17h10" /></svg>

const C = { viewBox: '0 0 32 12', 'aria-hidden': true } as const
export const RunGlyph = () => <svg {...C}><path d="M2 10Q14 0 28 6" /></svg>
export const PassGlyph = () => <svg {...C}><path d="M2 6H28" strokeDasharray="4 3" /></svg>
export const PressGlyph = () => <svg {...C}><path d="M2 6l3-3 3 6 3-6 3 6 3-6 3 6 3-3h6" /></svg>
