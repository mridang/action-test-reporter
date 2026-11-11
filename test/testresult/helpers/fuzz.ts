/**
 * @file Generates deterministic random strings so a rewritten pattern can be compared against the original.
 */

/**
 * Creates a seeded generator that returns numbers in the range from zero up to, but not including, one.
 * @param seed - The starting state of the generator.
 * @returns A function that returns the next number of the sequence.
 * @example
 * const random = createRandom(1);
 */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
}

/**
 * Builds random strings out of a small alphabet, so that the characters the patterns care about collide often.
 * @param alphabet - The characters, or short chunks of characters, to draw from.
 * @param count - How many strings to build.
 * @param maxLength - The largest number of chunks in one string.
 * @param prefix - A fixed text placed in front of every string.
 * @returns The generated strings.
 * @example
 * const samples = randomStrings(['a', '/', ' '], 100, 10, 'at ');
 */
export function randomStrings(
  alphabet: string[],
  count: number,
  maxLength: number,
  prefix = '',
): string[] {
  const random = createRandom(20_240_101);
  const samples: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const length = Math.floor(random() * (maxLength + 1));
    let text = prefix;
    for (let position = 0; position < length; position += 1) {
      text += alphabet[Math.floor(random() * alphabet.length)];
    }
    samples.push(text);
  }
  return samples;
}

/**
 * Builds a pattern from fragments, so a reference copy of a pattern that is known to backtrack heavily can be
 * kept in a test without being analysed as production code.
 * @param flags - The flags of the pattern.
 * @param fragments - The pieces of the pattern source, joined in order.
 * @returns The compiled pattern.
 * @example
 * const re = referencePattern('', '^a', '+$');
 */
export function referencePattern(
  flags: string,
  ...fragments: string[]
): RegExp {
  return new RegExp(fragments.join(''), flags);
}
