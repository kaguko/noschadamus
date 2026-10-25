/** Phần lá bài không cần JS: dùng được cả ở server component và client (docs/04 mục 7.8). */
import clsx from 'clsx';
import { Coins, Flame, Sparkles, Sword, Wine, type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import artManifest from './card-art-manifest.json';

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

export const HAS_ART: ReadonlySet<string> = new Set<string>(artManifest as string[]);

const SUIT_ICON: Record<string, LucideIcon> = {
  wands: Flame,
  cups: Wine,
  swords: Sword,
  pentacles: Coins,
};

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

/** Mặt dự phòng khi chưa có ảnh: số + biểu tượng + tên. */
export function FallbackFace({ card }: { card: TarotCardFace }) {
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

export const cardAlt = (card: TarotCardFace, reversedSuffix: string) =>
  `${card.name}${card.reversed ? reversedSuffix : ''}`;

/** Nội dung mặt trước: ảnh nếu có trong manifest, không thì mặt dự phòng. */
export function CardFront({
  card,
  width,
  alt,
  priority = false,
  onArtError,
}: {
  card: TarotCardFace;
  width: number;
  alt: string;
  priority?: boolean;
  onArtError?: () => void;
}) {
  return HAS_ART.has(card.cardId) ? (
    <Image
      src={`/cards/${card.cardId}.webp`}
      alt={alt}
      fill
      sizes={`${width}px`}
      priority={priority}
      className={clsx('object-cover', card.reversed && 'rotate-180')}
      onError={onArtError}
      draggable={false}
    />
  ) : (
    <div role="img" aria-label={alt} className="h-full w-full">
      <FallbackFace card={card} />
    </div>
  );
}

export const FACE_CLASS =
  'absolute inset-0 overflow-hidden rounded-[6cqw] shadow-[var(--shadow-card)] [backface-visibility:hidden]';

export function CardBack() {
  // eslint-disable-next-line @next/next/no-img-element -- SVG tĩnh nhỏ, không cần tối ưu ảnh
  return <img src="/card-back.svg" alt="" className="h-full w-full" draggable={false} />;
}

/** Lá bài tĩnh (không lật, không JS): cho phần trang trí như hero landing. */
export function TarotCardStatic({
  card,
  size = 'md',
  reversedAltSuffix = ', ngược',
  className,
  decorative = false,
}: {
  card?: TarotCardFace;
  size?: CardSize;
  reversedAltSuffix?: string;
  className?: string;
  decorative?: boolean;
}) {
  const w = CARD_SIZES[size];
  return (
    <div
      className={clsx('relative shrink-0 [container-type:inline-size]', className)}
      style={{ width: w, height: cardHeight(w) }}
      aria-hidden={decorative || !card}
    >
      <div className={clsx(FACE_CLASS, card && 'border border-white/14')}>
        {card ? (
          <CardFront card={card} width={w} alt={cardAlt(card, reversedAltSuffix)} />
        ) : (
          <CardBack />
        )}
      </div>
    </div>
  );
}
