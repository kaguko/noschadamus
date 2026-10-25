'use client';

import clsx from 'clsx';
import { Coins, Flame, Sparkles, Sword, Wine, type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { useLayoutEffect, useRef, useState } from 'react';
import artManifest from './card-art-manifest.json';

/** docs/04 mục 7.8 */
export const CARD_SIZES = {
  xs: 56,
  sm: 88,
  md: 104,
  lg: 160,
  xl: 220,
  '2xl': 280,
} as const;
export type CardSize = keyof typeof CARD_SIZES;
export const cardHeight = (w: number) => Math.round((w * 12) / 7);

export interface TarotCardFace {
  cardId: string;
  name: string;
  number: number;
  arcana: 'major' | 'minor';
  suit: string | null;
  reversed: boolean;
}

const HAS_ART = new Set<string>(artManifest as string[]);
const SUIT_ICON: Record<string, LucideIcon> = {
  wands: Flame,
  cups: Wine,
  swords: Sword,
  pentacles: Coins,
};
const FLIP_MS = 700;
const EMPHASIZED = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

export function toRoman(n: number): string {
  if (n === 0) return '0';
  const table: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let out = '';
  for (const [v, s] of table) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Mặt dự phòng khi chưa có ảnh: số + biểu tượng + tên (docs/04 mục 7.8). */
function FallbackFace({ card }: { card: TarotCardFace }) {
  const Icon = card.arcana === 'major' ? Sparkles : (SUIT_ICON[card.suit ?? ''] ?? Sparkles);
  const numeral = card.arcana === 'major' ? toRoman(card.number) : String(card.number);
  return (
    <div
      className={clsx(
        'flex h-full w-full flex-col items-center justify-between bg-gradient-to-b from-bg2 to-bg1 py-[9cqw] text-ink1',
        card.reversed && 'rotate-180',
      )}
    >
      <span className="font-display text-[13cqw] leading-none font-semibold text-accent-text">
        {numeral}
      </span>
      <Icon aria-hidden className="size-[40cqw] text-ink2" strokeWidth={1.25} />
      <span className="px-[6cqw] text-center text-[8.5cqw] leading-tight font-semibold tracking-[0.08em] uppercase">
        {card.name}
      </span>
    </div>
  );
}

export interface TarotCardProps {
  /** Mặt trước; bỏ trống nếu chỉ cần mặt sau (dải chọn bài). */
  card?: TarotCardFace;
  size?: CardSize;
  /** Chiều rộng px tùy chỉnh (ưu tiên hơn `size`). */
  width?: number;
  faceUp: boolean;
  /** Lật có hoạt ảnh khi faceUp đổi từ false → true. */
  animateFlip?: boolean;
  onFlipEnd?: () => void;
  /** Hậu tố alt cho lá ngược, vd. ", ngược". */
  reversedAltSuffix?: string;
  priority?: boolean;
  className?: string;
}

export function TarotCard({
  card,
  size = 'md',
  width,
  faceUp,
  animateFlip = false,
  onFlipEnd,
  reversedAltSuffix = ', ngược',
  priority = false,
  className,
}: TarotCardProps) {
  const w = width ?? CARD_SIZES[size];
  const h = cardHeight(w);
  const inner = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const prevFaceUp = useRef(faceUp);
  const [sheen, setSheen] = useState(false);
  const [artFailed, setArtFailed] = useState(false);

  useLayoutEffect(() => {
    const was = prevFaceUp.current;
    prevFaceUp.current = faceUp;
    if (was || !faceUp || !animateFlip || !inner.current) return;
    if (prefersReducedMotion()) {
      // Giảm chuyển động: mờ chéo 150 ms thay cho lật 3D.
      const a = front.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
      if (a) a.onfinish = () => onFlipEnd?.();
      else onFlipEnd?.();
      return;
    }
    const anim = inner.current.animate(
      [
        { transform: 'translateY(0) scale(1) rotateY(0deg)' },
        { transform: 'translateY(-8px) scale(1.03) rotateY(90deg)', offset: 0.5 },
        { transform: 'translateY(0) scale(1) rotateY(180deg)' },
      ],
      { duration: FLIP_MS, easing: EMPHASIZED },
    );
    anim.onfinish = () => {
      setSheen(true);
      onFlipEnd?.();
    };
    return () => anim.cancel();
  }, [faceUp, animateFlip, onFlipEnd]);

  const hasArt = card && HAS_ART.has(card.cardId) && !artFailed;
  const alt = card ? `${card.name}${card.reversed ? reversedAltSuffix : ''}` : '';

  return (
    <div
      className={clsx(
        'relative shrink-0 [container-type:inline-size] [perspective:900px]',
        className,
      )}
      style={{ width: w, height: h }}
      data-face={faceUp ? 'up' : 'down'}
    >
      <div
        ref={inner}
        className="relative h-full w-full [transform-style:preserve-3d]"
        style={{ transform: faceUp ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Mặt sau */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[6cqw] shadow-[var(--shadow-card)] [backface-visibility:hidden]"
          aria-hidden={faceUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG tĩnh nhỏ, không cần tối ưu ảnh */}
          <img src="/card-back.svg" alt="" className="h-full w-full" draggable={false} />
        </div>
        {/* Mặt trước */}
        <div
          ref={front}
          className="absolute inset-0 overflow-hidden rounded-[6cqw] border border-white/14 shadow-[var(--shadow-card)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
          aria-hidden={!faceUp}
        >
          {card &&
            (hasArt ? (
              <Image
                src={`/cards/${card.cardId}.webp`}
                alt={alt}
                fill
                sizes={`${w}px`}
                priority={priority}
                className={clsx('object-cover', card.reversed && 'rotate-180')}
                onError={() => setArtFailed(true)}
                draggable={false}
              />
            ) : (
              <div role="img" aria-label={alt} className="h-full w-full">
                <FallbackFace card={card} />
              </div>
            ))}
          {sheen && <span aria-hidden className="nd-sheen pointer-events-none absolute inset-0" />}
        </div>
      </div>
    </div>
  );
}

/** Nhãn dưới thẻ: vị trí · tên · hướng (docs/04 mục 7.8). */
export function CardCaption({
  position,
  name,
  orientation,
  className,
}: {
  position?: string;
  name: string;
  orientation?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-col items-center gap-1 text-center', className)}>
      {position && <span className="t-caption text-ink3">{position}</span>}
      <span className="font-display text-[16px] leading-snug font-medium text-ink1 lg:text-[18px]">
        {name}
      </span>
      {orientation}
    </div>
  );
}
