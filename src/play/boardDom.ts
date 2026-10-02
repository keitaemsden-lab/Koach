/**
 * The live pitch as the board canvas last laid it out. Play the move and PNG export read it;
 * only BoardCanvas writes it.
 */
export const boardDom = {
  svg: null as SVGSVGElement | null,
  land: false,
  /** CSS px per pitch unit (10 units = 1 m). */
  scale: 0.5,
}
