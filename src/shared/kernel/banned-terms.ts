const LETTER = /\p{L}/u;

/**
 * Tìm các cụm cấm trong văn bản (không phân biệt hoa thường, so khớp trọn âm tiết:
 * "nghiệp chướng" khớp, nhưng "an toàn" không khớp "an").
 */
export function findBannedTerms(text: string, terms: readonly string[]): string[] {
  const haystack = text.normalize('NFC').toLocaleLowerCase('vi');
  const found: string[] = [];
  for (const term of terms) {
    const needle = term.normalize('NFC').toLocaleLowerCase('vi');
    let from = 0;
    while (from <= haystack.length - needle.length) {
      const at = haystack.indexOf(needle, from);
      if (at < 0) break;
      const before = at > 0 ? haystack[at - 1]! : ' ';
      const after = at + needle.length < haystack.length ? haystack[at + needle.length]! : ' ';
      if (!LETTER.test(before) && !LETTER.test(after)) {
        found.push(term);
        break;
      }
      from = at + 1;
    }
  }
  return found;
}
