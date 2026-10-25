/** Trạng thái luồng rút bài (docs/05 mục 2). Thuần, test được. */
export type SpreadId = 'single' | 'three';
export type Step = 1 | 2 | 3;

export interface DrawState {
  step: Step;
  spreadId: SpreadId | null;
  allowReversed: boolean;
  intention: string;
  storeIntention: boolean;
}

export type DrawAction =
  | { type: 'selectSpread'; spreadId: SpreadId }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'setIntention'; value: string }
  | { type: 'setStore'; value: boolean }
  | { type: 'setReversed'; value: boolean }
  | { type: 'reset' };

export const INITIAL_DRAW: DrawState = {
  step: 1,
  spreadId: null,
  allowReversed: true,
  intention: '',
  storeIntention: false,
};

export function drawReducer(s: DrawState, a: DrawAction): DrawState {
  switch (a.type) {
    case 'selectSpread':
      return { ...s, spreadId: a.spreadId };
    case 'next':
      if (s.step === 1 && !s.spreadId) return s;
      return s.step < 3 ? { ...s, step: (s.step + 1) as Step } : s;
    case 'back':
      return s.step > 1 ? { ...s, step: (s.step - 1) as Step } : s;
    case 'setIntention': {
      // Hết chữ thì tự tắt "lưu ý niệm" (docs/05 mục 2.2).
      const empty = a.value.trim().length === 0;
      return { ...s, intention: a.value, storeIntention: empty ? false : s.storeIntention };
    }
    case 'setStore':
      return { ...s, storeIntention: s.intention.trim().length > 0 && a.value };
    case 'setReversed':
      return { ...s, allowReversed: a.value };
    case 'reset':
      return INITIAL_DRAW;
  }
}

export const DRAFT_KEY = 'nd:draft';

/** Đọc bản nháp; dữ liệu hỏng hoặc bộ nhớ bị chặn → trạng thái đầu. */
export function parseDraft(raw: string | null): DrawState {
  if (!raw) return INITIAL_DRAW;
  try {
    const d = JSON.parse(raw) as Partial<DrawState>;
    const step = d.step === 2 || d.step === 3 ? d.step : 1;
    const spreadId = d.spreadId === 'single' || d.spreadId === 'three' ? d.spreadId : null;
    const intention = typeof d.intention === 'string' ? d.intention.slice(0, 2000) : '';
    return {
      step: spreadId ? step : 1,
      spreadId,
      allowReversed: d.allowReversed !== false,
      intention,
      storeIntention: d.storeIntention === true && intention.trim().length > 0,
    };
  } catch {
    return INITIAL_DRAW;
  }
}

export function loadDraft(): DrawState {
  try {
    return parseDraft(sessionStorage.getItem(DRAFT_KEY));
  } catch {
    return INITIAL_DRAW;
  }
}

export function saveDraft(s: DrawState): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(s));
  } catch {
    // bộ nhớ bị chặn: bỏ qua
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // bỏ qua
  }
}

export const abandonedStep = (step: Step) =>
  step === 1 ? 'spread' : step === 2 ? 'intention' : 'pick';
