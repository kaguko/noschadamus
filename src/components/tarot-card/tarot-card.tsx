'use client';

import clsx from 'clsx';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  CARD_SIZES,
  CardBack,
  CardFront,
  cardAlt,
  cardHeight,
  FACE_CLASS,
  FallbackFace,
  type CardSize,
  type TarotCardFace,
} from './card-face';

export {
  CARD_SIZES,
  cardHeight,
  cardVisibleLabel,
  toRoman,
  type CardSize,
  type TarotCardFace,
} from './card-face';

const FLIP_MS = 700;
const EMPHASIZED = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
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

  const alt = card ? cardAlt(card, reversedAltSuffix) : '';

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
        <div className={FACE_CLASS} aria-hidden={faceUp}>
          <CardBack />
        </div>
        <div
          ref={front}
          className={clsx(FACE_CLASS, 'border border-white/14 [transform:rotateY(180deg)]')}
          aria-hidden={!faceUp}
        >
          {card &&
            (artFailed ? (
              <div role="img" aria-label={alt} className="h-full w-full">
                <FallbackFace card={card} />
              </div>
            ) : (
              <CardFront
                card={card}
                width={w}
                alt={alt}
                priority={priority}
                onArtError={() => setArtFailed(true)}
              />
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
