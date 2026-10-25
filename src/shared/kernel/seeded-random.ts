import { mulberry32 } from './prng';

/** Nguồn ngẫu nhiên có hạt giống cho test và script demo. KHÔNG dùng để rút bài thật. */
export function seededRandomSource(seed: number): { nextUint32(): number } {
  const rand = mulberry32(seed);
  return { nextUint32: () => Math.floor(rand() * 0x100000000) >>> 0 };
}

/** Nguồn trả lần lượt các giá trị cho trước (lặp lại khi hết). */
export function sequenceRandomSource(values: readonly number[]): { nextUint32(): number } {
  let i = 0;
  return {
    nextUint32: () => {
      const v = values[i % values.length]!;
      i++;
      return v >>> 0;
    },
  };
}
