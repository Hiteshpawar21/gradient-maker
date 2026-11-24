// Shared utility functions

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Generate a short random ID (7 alphanumeric chars). */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
