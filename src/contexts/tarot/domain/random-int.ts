/** Port: nguồn ngẫu nhiên. Hạ tầng cung cấp CSPRNG; test dùng nguồn có hạt giống. */
export interface RandomSource {
  /** Số nguyên không dấu 32-bit, phân phối đều trên [0, 2^32). */
  nextUint32(): number;
}

const RANGE = 0x100000000;

/** Số nguyên đều trong [0, maxExclusive), không lệch modulo (rejection sampling). */
export function randomInt(rng: RandomSource, maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > RANGE) {
    throw new RangeError(`maxExclusive không hợp lệ: ${maxExclusive}`);
  }
  const limit = Math.floor(RANGE / maxExclusive) * maxExclusive;
  let x: number;
  do {
    x = rng.nextUint32();
  } while (x >= limit);
  return x % maxExclusive;
}
