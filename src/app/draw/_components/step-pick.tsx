'use client';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { track } from '@/components/analytics/track';
import { usePrefersReducedMotion } from '@/components/hooks/use-reduced-motion';
import { ActionBar } from '@/components/layout/site-chrome';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { t } from '@/shared/i18n';
import { clearDraft, type DrawState, type SpreadId } from './draw-state';
import { StepHeading } from './steps';

const DECK = 78;
const SHUFFLE_MS = 1400;
const MIN_LOADING_MS = 1400;
const LOADING_SWITCH_MS = 900;
const FLY_MS = 500;
const SLOT_W = 88;
const SLOT_H = Math.round((SLOT_W * 12) / 7);

type Phase = 'shuffle' | 'fan' | 'submitting';

function slotLabels(spreadId: SpreadId): string[] {
  return spreadId === 'single'
    ? [t('reading.position_single')]
    : [t('draw.s3.slot_past'), t('draw.s3.slot_present'), t('draw.s3.slot_opening')];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function StepPick({
  headingRef,
  state,
  spreadId,
  onSubmitted,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  state: DrawState;
  spreadId: SpreadId;
  onSubmitted: () => void;
}) {
  const need = spreadId === 'single' ? 1 : 3;
  const labels = slotLabels(spreadId);
  const reduced = usePrefersReducedMotion();
  const router = useRouter();
  const toast = useToast();

  const [phase, setPhase] = useState<Phase>('shuffle');
  const [picked, setPicked] = useState<number[]>([]);
  const [loadingText, setLoadingText] = useState(t('draw.s3.loading1'));
  const [failed, setFailed] = useState(false);
  const [focusIndex, setFocusIndex] = useState(Math.floor(DECK / 2));
  const [scrolled, setScrolled] = useState(false);

  const stripRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const deckRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------- xáo
  const shuffle = useCallback(async () => {
    if (phase !== 'shuffle') return;
    if (!reduced) {
      try {
        navigator.vibrate?.(12);
      } catch {
        // không hỗ trợ rung
      }
      const cards = Array.from(
        deckRef.current?.querySelectorAll<HTMLElement>('[data-riffle]') ?? [],
      );
      const anims = cards.map((el, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        return el.animate(
          [
            { transform: 'translate(0,0) rotate(0deg)' },
            { transform: `translate(${side * 60}px, 0) rotate(${side * 4}deg)`, offset: 0.28 },
            { transform: `translate(${side * 18}px, -22px) rotate(${side * 2}deg)`, offset: 0.62 },
            { transform: 'translate(0,0) rotate(0deg)' },
          ],
          {
            duration: SHUFFLE_MS - 60 * 9,
            delay: i * 60,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          },
        );
      });
      await Promise.all(anims.map((a) => a.finished.catch(() => undefined)));
    }
    setPhase('fan');
  }, [phase, reduced]);

  // Vào dải: căn giữa và đưa focus vào lá giữa.
  useEffect(() => {
    if (phase !== 'fan') return;
    const strip = stripRef.current;
    if (strip && strip.scrollWidth > strip.clientWidth && strip.scrollLeft === 0) {
      strip.scrollLeft = (strip.scrollWidth - strip.clientWidth) / 2;
    }
  }, [phase]);

  // ---------------------------------------------------------------- chọn
  const flyToSlot = useCallback(
    (index: number, slot: number) => {
      const from = cardRefs.current[index]?.getBoundingClientRect();
      const to = slotRefs.current[slot]?.getBoundingClientRect();
      if (!from || !to || reduced) return;
      const ghost = document.createElement('div');
      ghost.className = 'nd-card-back nd-ghost';
      Object.assign(ghost.style, {
        position: 'fixed',
        left: `${from.left}px`,
        top: `${from.top}px`,
        width: `${from.width}px`,
        height: `${from.height}px`,
        zIndex: '60',
        pointerEvents: 'none',
      });
      document.body.appendChild(ghost);
      const dx = to.left - from.left;
      const dy = to.top - from.top;
      const s = to.width / from.width;
      ghost
        .animate(
          [
            { transform: 'translate(0,0) scale(1)', offset: 0 },
            {
              transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(${(1 + s) / 2})`,
              offset: 0.55,
            },
            { transform: `translate(${dx}px, ${dy}px) scale(${s})` },
          ],
          {
            duration: FLY_MS,
            delay: 120,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            fill: 'forwards',
          },
        )
        .finished.catch(() => undefined)
        .finally(() => ghost.remove());
    },
    [reduced],
  );

  const toggle = useCallback(
    (index: number) => {
      if (phase !== 'fan') return;
      setFailed(false);
      setPicked((prev) => {
        if (prev.includes(index)) return prev.filter((x) => x !== index);
        if (prev.length >= need) return prev;
        const next = [...prev, index];
        flyToSlot(index, prev.length);
        if (next.length === need) track('cards_picked', { count: need });
        return next;
      });
    },
    [phase, need, flyToSlot],
  );

  function onStripKey(e: KeyboardEvent) {
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let nextIndex = focusIndex;
    if (e.key in moves) nextIndex = Math.min(DECK - 1, Math.max(0, focusIndex + moves[e.key]!));
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = DECK - 1;
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle(focusIndex);
      return;
    } else return;
    e.preventDefault();
    setFocusIndex(nextIndex);
    const el = cardRefs.current[nextIndex];
    el?.focus();
    el?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: reduced ? 'auto' : 'smooth',
    });
  }

  // ---------------------------------------------------------------- gửi
  async function reveal() {
    if (picked.length !== need || phase === 'submitting') return;
    setPhase('submitting');
    setFailed(false);
    setLoadingText(t('draw.s3.loading1'));
    const switchText = window.setTimeout(
      () => setLoadingText(t('draw.s3.loading2')),
      LOADING_SWITCH_MS,
    );
    const keepIntention = state.storeIntention && state.intention.trim().length > 0;
    const body = {
      spreadId,
      allowReversed: state.allowReversed,
      // Chỉ gửi ý niệm khi người dùng chọn lưu: không lưu thì không rời khỏi trình duyệt.
      ...(keepIntention ? { intention: state.intention.trim(), storeIntention: true } : {}),
      pickedSlots: picked,
    };
    try {
      const [res] = await Promise.all([
        fetch('/api/readings', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }),
        sleep(reduced ? 0 : MIN_LOADING_MS),
      ]);
      if (!res.ok) {
        const code = ((await res.json().catch(() => null)) as { error?: { code?: string } } | null)
          ?.error?.code;
        throw new Error(code ?? 'INTERNAL');
      }
      const { id, path } = (await res.json()) as { id: string; path: string };
      try {
        sessionStorage.setItem(`nd:reveal:${id}`, '1');
      } catch {
        // không có bộ nhớ: trang kết quả hiện trạng thái cuối
      }
      onSubmitted();
      clearDraft();
      router.push(path);
    } catch (err) {
      window.clearTimeout(switchText);
      setPhase('fan');
      setFailed(true);
      const code = err instanceof Error ? err.message : '';
      const offline =
        err instanceof TypeError || (typeof navigator !== 'undefined' && !navigator.onLine);
      toast(
        code === 'RATE_LIMITED'
          ? t('draw.error.rate')
          : offline
            ? t('common.offline')
            : t('draw.error.generic'),
        'error',
      );
      return;
    }
    window.clearTimeout(switchText);
  }

  // ---------------------------------------------------------------- giao diện
  const remaining = need - picked.length;
  const title =
    phase === 'shuffle'
      ? t('draw.s3.title_shuffle')
      : phase === 'submitting'
        ? loadingText
        : need === 1
          ? t('draw.s3.title_pick_one')
          : t('draw.s3.title_pick', { count: need });

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {phase === 'fan' && picked.length > 0
          ? t('draw.s3.picked_live', { k: picked.length, n: need })
          : ''}
      </div>

      <div className={clsx(phase === 'shuffle' && 'text-center')}>
        <StepHeading ref={headingRef} title={title} />
        {phase !== 'shuffle' && (
          <p className="t-caption t-num mt-2 text-ink2">
            {t('draw.s3.picked', { k: picked.length, n: need })}
          </p>
        )}
      </div>

      {phase === 'shuffle' ? (
        <div className="flex flex-col items-center gap-8 py-6">
          <button
            type="button"
            aria-label={t('draw.s3.deck_label')}
            onClick={shuffle}
            className="nd-breathe relative rounded-[10px]"
            style={{ width: 160, height: 274 }}
          >
            <div ref={deckRef} className="absolute inset-0">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  data-riffle=""
                  className="nd-card-back absolute inset-0"
                  style={{ transform: `translate(${-i * 0.6}px, ${-i * 0.6}px)` }}
                />
              ))}
            </div>
          </button>
          <div className="flex flex-col items-center gap-3">
            <Button size="lg" onClick={shuffle} className="min-w-48">
              {t('draw.s3.shuffle')}
            </Button>
            <button
              type="button"
              onClick={() => setPhase('fan')}
              className="rounded-full px-3 py-2 text-[14px] font-medium text-ink2 underline-offset-4 hover:text-ink1 hover:underline"
            >
              {t('draw.s3.skip_shuffle')}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Ô chứa lá đã chọn */}
          <div className="flex justify-center gap-4">
            {labels.map((label, slot) => {
              const filled = slot < picked.length;
              return (
                <div key={slot} className="flex flex-col items-center gap-2">
                  <div
                    ref={(el) => {
                      slotRefs.current[slot] = el;
                    }}
                    className={clsx(
                      'relative rounded-[6px] border-[1.5px] border-dashed',
                      filled ? 'border-transparent' : 'nd-slot-wait border-line-strong',
                    )}
                    style={{ width: SLOT_W, height: SLOT_H }}
                  >
                    {filled && (
                      <button
                        type="button"
                        onClick={() => toggle(picked[slot]!)}
                        disabled={phase !== 'fan'}
                        aria-label={`${label}: ${t('draw.s3.card_label', { n: picked[slot]! + 1 })}`}
                        className={clsx(
                          'nd-card-back absolute inset-0',
                          phase === 'submitting' && !reduced && 'nd-pulse',
                        )}
                        style={
                          reduced
                            ? undefined
                            : { animation: `nd-fade-in 150ms ${FLY_MS + 100}ms both` }
                        }
                      />
                    )}
                    {!filled && (
                      <span className="sr-only">{t('draw.s3.slot_empty', { label })}</span>
                    )}
                  </div>
                  <span className="t-caption text-ink3">{label}</span>
                </div>
              );
            })}
          </div>

          {/* Dải (di động) / quạt (desktop) 78 lá */}
          <div className="relative">
            <div
              ref={stripRef}
              role="listbox"
              aria-multiselectable="true"
              aria-label={t('draw.s3.fan_label')}
              aria-disabled={phase === 'submitting'}
              onKeyDown={onStripKey}
              onScroll={() => setScrolled(true)}
              className={clsx('nd-fan', phase === 'submitting' && 'pointer-events-none opacity-60')}
            >
              {Array.from({ length: DECK }, (_, i) => {
                const isPicked = picked.includes(i);
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    role="option"
                    aria-selected={isPicked}
                    aria-label={t('draw.s3.card_label', { n: i + 1 })}
                    tabIndex={i === focusIndex ? 0 : -1}
                    onClick={() => {
                      setFocusIndex(i);
                      toggle(i);
                    }}
                    onFocus={() => setFocusIndex(i)}
                    className={clsx('nd-fan-card nd-card-back', isPicked && 'is-picked')}
                    style={{ '--i': i } as React.CSSProperties}
                  />
                );
              })}
            </div>
            <div aria-hidden className="nd-fan-fade-l" />
            <div aria-hidden className="nd-fan-fade-r" />
            {!scrolled && (
              <p aria-hidden className="t-small mt-1 text-center text-ink3 lg:hidden">
                {t('draw.s3.hint_scroll')}
              </p>
            )}
          </div>

          <p className="t-small mx-auto max-w-[52ch] text-center text-ink3">
            {t('draw.s3.honesty')}
          </p>

          <ActionBar className="lg:justify-center">
            <Button
              size="lg"
              full
              className="lg:w-auto lg:min-w-56"
              disabled={remaining > 0}
              loading={phase === 'submitting'}
              onClick={reveal}
            >
              {remaining > 0
                ? t('draw.s3.need_more', { r: remaining })
                : failed
                  ? t('common.retry')
                  : t('draw.s3.reveal')}
            </Button>
          </ActionBar>
        </>
      )}
    </>
  );
}
