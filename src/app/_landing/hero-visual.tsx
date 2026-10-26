/** Ba lá xếp quạt + hào quang + Soul Map mờ xoay chậm (docs/05 mục 1). Render tĩnh ở server: không JS. */
import clsx from 'clsx';
import { StaticSoulMap } from '@/components/soul-map/static-soul-map';
import { TarotCardStatic } from '@/components/tarot-card/card-face';
import type { ReadingView } from '@/contexts/reading/application/dto';

const CARDS = [
  { rotate: -12, y: 12, faceUp: false, delay: '0s' },
  { rotate: 0, y: 0, faceUp: true, delay: '1s' },
  { rotate: 12, y: 12, faceUp: false, delay: '2s' },
];

export function HeroVisual({ map }: { map: ReadingView['soulMap'] }) {
  return (
    <div
      aria-hidden
      // Soul Map xoay: khung bao vuông khi nghiêng rộng hơn màn 360px, cắt ngang để không cuộn ngang.
      className="relative mx-auto flex h-[340px] w-full max-w-[520px] min-w-0 items-center justify-center overflow-x-clip lg:h-[520px]"
    >
      <div className="absolute size-[420px] max-w-full rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_25%,transparent),transparent_68%)]" />
      <StaticSoulMap
        className="nd-spin-slow absolute w-[360px] max-w-[92%] opacity-20 lg:w-[480px]"
        vector={map.display.vector}
        dominant={map.dominant}
        quiet={map.quiet}
        showLabels={false}
        showLayers={false}
        idPrefix="hero"
      />
      {/* Thu nhỏ trên di động để ba lá cỡ lg vừa màn 360px. */}
      <div className="relative flex scale-[0.72] items-center sm:scale-90 lg:scale-100">
        {CARDS.map((c, i) => (
          <div
            key={i}
            className={clsx('nd-float', i > 0 && '-ml-[56px] lg:-ml-[64px]')}
            style={{ animationDelay: c.delay, zIndex: c.faceUp ? 2 : 1 }}
          >
            <div style={{ transform: `translateY(${c.y}px) rotate(${c.rotate}deg)` }}>
              <TarotCardStatic
                size="lg"
                decorative
                card={
                  c.faceUp
                    ? {
                        cardId: 'major-17',
                        name: 'Ngôi Sao',
                        number: 17,
                        arcana: 'major',
                        suit: null,
                        reversed: false,
                      }
                    : undefined
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
