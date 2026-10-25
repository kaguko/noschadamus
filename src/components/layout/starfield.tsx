import { mulberry32 } from '@/shared/kernel/prng';

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  twinkle: { dur: number; delay: number } | null;
}

const STAR_COUNT = 80;
const TWINKLE_COUNT = 12;

/** Vị trí cố định từ mulberry32(7) để server và client giống nhau (docs/04 mục 5). */
function buildStars(): Star[] {
  const rand = mulberry32(7);
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    x: rand() * 100,
    y: rand() * 100,
    r: 0.5 + rand() * 1.1,
    o: 0.25 + rand() * 0.65,
    twinkle: i < TWINKLE_COUNT ? { dur: 4 + rand() * 5, delay: rand() * 5 } : null,
  }));
}

const STARS = buildStars();

export function Starfield() {
  return (
    <svg className="nd-stars" aria-hidden="true" focusable="false">
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x.toFixed(3)}%`}
          cy={`${s.y.toFixed(3)}%`}
          r={s.r.toFixed(2)}
          fill="#F3EEE3"
          opacity={s.o.toFixed(2)}
          className={s.twinkle ? 'nd-twinkle' : undefined}
          style={
            s.twinkle
              ? ({
                  '--tw-dur': `${s.twinkle.dur.toFixed(2)}s`,
                  '--tw-delay': `${s.twinkle.delay.toFixed(2)}s`,
                } as React.CSSProperties)
              : undefined
          }
        />
      ))}
    </svg>
  );
}
