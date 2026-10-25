import { describe, expect, it } from 'vitest';
import { drawReducer, INITIAL_DRAW, parseDraft, type DrawState } from './draw-state';

const run = (actions: Parameters<typeof drawReducer>[1][], s: DrawState = INITIAL_DRAW) =>
  actions.reduce(drawReducer, s);

describe('drawReducer', () => {
  it('không qua bước 1 khi chưa chọn trải bài', () => {
    expect(run([{ type: 'next' }]).step).toBe(1);
    expect(run([{ type: 'selectSpread', spreadId: 'three' }, { type: 'next' }]).step).toBe(2);
  });

  it('lùi/tiến trong khoảng 1-3', () => {
    const s = run([
      { type: 'selectSpread', spreadId: 'single' },
      { type: 'next' },
      { type: 'next' },
      { type: 'next' },
    ]);
    expect(s.step).toBe(3);
    expect(run([{ type: 'back' }, { type: 'back' }, { type: 'back' }], s).step).toBe(1);
  });

  it('lưu ý niệm chỉ bật được khi có chữ; xóa hết chữ thì tự tắt', () => {
    expect(run([{ type: 'setStore', value: true }]).storeIntention).toBe(false);
    const s = run([
      { type: 'setIntention', value: 'một điều' },
      { type: 'setStore', value: true },
    ]);
    expect(s.storeIntention).toBe(true);
    expect(run([{ type: 'setIntention', value: '   ' }], s).storeIntention).toBe(false);
  });
});

describe('parseDraft', () => {
  it('khôi phục bản nháp hợp lệ', () => {
    const d = parseDraft(
      JSON.stringify({
        step: 2,
        spreadId: 'three',
        allowReversed: false,
        intention: 'x',
        storeIntention: true,
      }),
    );
    expect(d).toEqual({
      step: 2,
      spreadId: 'three',
      allowReversed: false,
      intention: 'x',
      storeIntention: true,
    });
  });

  it('dữ liệu hỏng hoặc thiếu spread → về bước 1 an toàn', () => {
    expect(parseDraft('{oops')).toEqual(INITIAL_DRAW);
    expect(parseDraft(JSON.stringify({ step: 3, spreadId: 'celtic' })).step).toBe(1);
    expect(parseDraft(null)).toEqual(INITIAL_DRAW);
    expect(parseDraft(JSON.stringify({ intention: '', storeIntention: true })).storeIntention).toBe(
      false,
    );
  });
});
