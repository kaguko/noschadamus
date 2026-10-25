import { randomBytes } from 'node:crypto';
import type { IdGenerator } from '../application/ports';

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** Chuỗi base58 đều (rejection sampling trên từng byte; 58 × 4 = 232). */
export function randomBase58(length: number): string {
  let out = '';
  while (out.length < length) {
    for (const b of randomBytes(length * 2)) {
      if (b < 232) out += BASE58[b % 58];
      if (out.length === length) break;
    }
  }
  return out;
}

export class CryptoIdGenerator implements IdGenerator {
  /** 'rd_' + 16 ký tự base58 (~93 bit). */
  readingId() {
    return `rd_${randomBase58(16)}`;
  }
  /** 22 ký tự base64url (128 bit, R6). */
  shareToken() {
    return randomBytes(16).toString('base64url');
  }
}
