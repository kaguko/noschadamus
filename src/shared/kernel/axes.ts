/** Thứ tự vẽ radar (từ đỉnh, theo chiều kim đồng hồ) và thứ tự phá hòa. */
export const AXIS_ORDER = [
  'energy',
  'emotion',
  'connection',
  'grounding',
  'mind',
  'change',
] as const;

export type AxisId = (typeof AXIS_ORDER)[number];
export type AxisVector = Readonly<Record<AxisId, number>>;

export const AXIS_LABEL_VI: Readonly<Record<AxisId, string>> = {
  energy: 'Năng lượng',
  emotion: 'Cảm xúc',
  connection: 'Kết nối',
  grounding: 'Nền tảng',
  mind: 'Lý trí',
  change: 'Thay đổi',
};

export const AXIS_COLOR: Readonly<Record<AxisId, string>> = {
  energy: '#F2A65A',
  emotion: '#E58FB0',
  connection: '#7FD6C2',
  grounding: '#C9B06B',
  mind: '#8FB4FF',
  change: '#A79BFF',
};

export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);
