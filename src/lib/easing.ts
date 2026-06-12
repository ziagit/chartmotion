export function easeLinear(t: number): number {
  return t;
}

export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

export function easeOutElastic(t: number): number {
  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
}

export function easeSpring(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  // A clean, solid spring curve
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export type EasingType = 'linear' | 'ease' | 'ease-in-out' | 'spring';

export function getEasedProgress(easing: EasingType, t: number): number {
  // Clamp t to [0, 1]
  const ct = Math.min(Math.max(t, 0), 1);
  switch (easing) {
    case 'linear':
      return easeLinear(ct);
    case 'ease':
      return easeOutQuad(ct);
    case 'ease-in-out':
      return easeInOutCubic(ct);
    case 'spring':
      return easeSpring(ct);
    default:
      return easeInOutCubic(ct);
  }
}
