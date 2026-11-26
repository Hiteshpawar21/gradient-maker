// ---------------------------------------------------------------------------
// Seeded PRNG (Mulberry32)
// Deterministic 32-bit PRNG for reproducible procedural noise.
// Same seed always gives the exact same sequence.
// Pure math — zero dependencies, zero any types.
// ---------------------------------------------------------------------------

export type PRNG = () => number

/**
 * Creates a deterministic pseudo-random number generator from a 32-bit integer seed.
 * Algorithm: Mulberry32
 * Returns float in [0, 1).
 */
export function createPRNG(seed: number): PRNG {
  // Ensure seed is a 32-bit integer
  let s = Math.floor(seed) >>> 0

  return function prng(): number {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Creates a Gaussian (normal) random number generator using the Box-Muller transform.
 * Returns float values centered around `mean` with standard deviation `stdDev`.
 */
export function createGaussianPRNG(
  seed: number,
  mean = 0.5,
  stdDev = 0.2,
): () => number {
  const uniform = createPRNG(seed)
  let haveSpare = false
  let spare = 0

  return function gaussian(): number {
    if (haveSpare) {
      haveSpare = false
      return mean + spare * stdDev
    }

    let u = 0
    let v = 0
    let s = 0

    do {
      u = uniform() * 2 - 1
      v = uniform() * 2 - 1
      s = u * u + v * v
    } while (s >= 1 || s === 0)

    const mul = Math.sqrt((-2 * Math.log(s)) / s)
    spare = v * mul
    haveSpare = true
    return mean + u * mul * stdDev
  }
}
