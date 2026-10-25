import { getRandomValues } from 'node:crypto';
import type { RandomSource } from '../application/ports';

const BATCH = 64;

/** Nguồn ngẫu nhiên an toàn (CSPRNG) cho việc rút bài thật (R3). */
export class CsprngRandomSource implements RandomSource {
  private buffer = new Uint32Array(BATCH);
  private index = BATCH;

  nextUint32(): number {
    if (this.index >= BATCH) {
      getRandomValues(this.buffer);
      this.index = 0;
    }
    return this.buffer[this.index++]!;
  }
}
