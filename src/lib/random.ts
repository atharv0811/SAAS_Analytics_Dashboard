/**
 * Small seeded PRNG (mulberry32). Mock data must be identical on the server
 * and in the browser, so Math.random is never used for generated records.
 */
export function createRandom(seed: number) {
  let state = seed >>> 0;

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    between(min: number, max: number) {
      return min + next() * (max - min);
    },
    int(min: number, max: number) {
      return Math.floor(min + next() * (max - min + 1));
    },
    pick<T>(items: readonly T[]): T {
      return items[Math.floor(next() * items.length)];
    },
    /** Picks from weighted options; weights need not sum to 1. */
    weighted<T>(options: readonly (readonly [T, number])[]): T {
      const total = options.reduce((sum, [, weight]) => sum + weight, 0);
      let roll = next() * total;
      for (const [value, weight] of options) {
        roll -= weight;
        if (roll <= 0) return value;
      }
      return options[options.length - 1][0];
    },
    /** Poisson-distributed count, used for daily event volumes. */
    poisson(mean: number) {
      const limit = Math.exp(-mean);
      let product = next();
      let count = 0;
      while (product > limit) {
        product *= next();
        count += 1;
      }
      return count;
    },
  };
}

export type Random = ReturnType<typeof createRandom>;
