import { notFound } from 'next/navigation';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { AXIS_COLOR, AXIS_LABEL_VI, AXIS_ORDER } from '@/shared/kernel/axes';

export const metadata = { title: 'Token', robots: { index: false } };

const COLORS = [
  'bg-0',
  'bg-1',
  'bg-2',
  'bg-3',
  'line',
  'line-strong',
  'text-1',
  'text-2',
  'text-3',
  'accent',
  'accent-hover',
  'accent-press',
  'accent-soft',
  'focus',
  'danger',
  'success',
  'info',
];

const TYPE = [
  ['t-display', 'Không đoán tương lai.'],
  ['t-h1', 'Ngọn Lửa Dịch Chuyển'],
  ['t-h2', 'Từng lá bài nói gì'],
  ['t-h3', 'Chàng Khờ · Ngôi Sao'],
  ['t-body-lg', 'Rút 1 hoặc 3 lá tarot, nhận một bản đồ linh hồn đẹp để giữ lại.'],
  ['t-body', 'Ánh sáng vẫn ở đó, chỉ là hôm nay bạn khó nhìn thấy nó. ềếổữ ỷỹ ặẫ'],
  ['t-small', 'Ảnh không chứa điều bạn đã viết.'],
  ['t-caption', 'Bản đồ linh hồn'],
] as const;

const SPACING = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128];

export default function TokensPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <main className="container-page py-12 space-y-16">
      <div className="flex items-center justify-between">
        <h1 className="t-h1">Token</h1>
        <ThemeToggle className="h-11 w-11 rounded-full border border-line-strong" />
      </div>

      <section className="space-y-4">
        <h2 className="t-h2">Màu</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {COLORS.map((c) => (
            <div key={c} className="rounded-lg border border-line p-3">
              <div
                className="h-12 rounded-md border border-line"
                style={{ background: `var(--${c})` }}
              />
              <p className="t-small mt-2 text-ink2">--{c}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {AXIS_ORDER.map((a) => (
            <div key={a} className="rounded-lg border border-line p-3">
              <div className="h-12 rounded-md" style={{ background: AXIS_COLOR[a] }} />
              <p className="t-small mt-2">{AXIS_LABEL_VI[a]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="t-h2">Chữ</h2>
        {TYPE.map(([cls, text]) => (
          <div key={cls}>
            <p className="t-caption text-ink3">.{cls}</p>
            <p className={cls}>{text}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="t-h2">Khoảng cách</h2>
        {SPACING.map((s) => (
          <div key={s} className="flex items-center gap-4">
            <span className="t-small t-num w-10 text-ink3">{s}</span>
            <span className="h-3 rounded-sm bg-accent" style={{ width: s }} />
          </div>
        ))}
      </section>
    </main>
  );
}
