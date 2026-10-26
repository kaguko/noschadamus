'use client';

import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { Info, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { track } from '@/components/analytics/track';
import { usePrefersReducedMotion } from '@/components/hooks/use-reduced-motion';
import { Disclaimer } from '@/components/layout/footer';
import { ActionBar } from '@/components/layout/site-chrome';
import { AxisMeterList } from '@/components/soul-map/axis-meter';
import { SoulMap } from '@/components/soul-map/soul-map';
import {
  CardCaption,
  TarotCard,
  cardVisibleLabel,
  type CardSize,
} from '@/components/tarot-card/tarot-card';
import { ButtonLink } from '@/components/ui/button';
import { KeywordChip, OrientationChip } from '@/components/ui/chip';
import { SheetDialog } from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { Eyebrow, Surface } from '@/components/ui/misc';
import { SwitchRow } from '@/components/ui/switch';
import type { ReadingCardView, ReadingView } from '@/contexts/reading/application/dto';
import { AXIS_LABEL_VI } from '@/shared/kernel/axes';
import { formatDate, t } from '@/shared/i18n';

/** Trình tự lần đầu (docs/05 mục 3.3), ms từ lúc vào trang. */
const T = {
  flip: [300, 1000, 1700],
  map: 2600,
  meter: 3400,
  title: 3500,
  rest: 4200,
  end: 4700,
} as const;
const MILESTONES = [...T.flip, T.map, T.meter, T.title, T.rest, T.end];

/** Đồng hồ trình tự: chỉ đổi state ở các mốc (không render lại mỗi khung hình). */
function useRevealClock(active: boolean) {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState<number>(active ? 0 : Infinity);
  const running = active && !reduced;

  useEffect(() => {
    if (!active) return;
    if (!running) {
      const id = requestAnimationFrame(() => setT(Infinity));
      return () => cancelAnimationFrame(id);
    }
    const timers = MILESTONES.map((ms) =>
      window.setTimeout(() => setT(ms === T.end ? Infinity : ms), ms),
    );
    // Chạm hoặc bấm phím bất kỳ: nhảy thẳng tới trạng thái cuối.
    const skip = () => setT(Infinity);
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
  }, [active, running]);

  return t;
}

/** Ngày theo múi giờ trình duyệt; server dùng UTC rồi client cập nhật sau hydrate. */
function LocalDate({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    () => () => {},
    () => formatDate(iso),
    () => formatDate(iso, 'UTC'),
  );
  return <>{text}</>;
}

function Fade({
  shown,
  children,
  className,
}: {
  shown: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'transition-[opacity,transform] duration-500 ease-[var(--ease-emphasized)]',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

const orientationLabel = (c: ReadingCardView) =>
  c.orientation === 'reversed'
    ? t('reading.orientation_reversed')
    : t('reading.orientation_upright');

const face = (c: ReadingCardView) => ({
  cardId: c.cardId,
  name: c.name,
  number: c.number,
  arcana: c.arcana,
  suit: c.suit,
  reversed: c.orientation === 'reversed',
});

export interface ReadingScreenProps {
  view: ReadingView;
  mode: 'owner' | 'shared';
  reveal: boolean;
  /** Nội dung thêm ở cuối (vd. CTA của trang xem chung). */
  footer?: ReactNode;
  /** Các nút trong ActionBar (vd. Chia sẻ, Rút lại). */
  actions?: ReactNode;
  /** Nội dung cạnh ngày (vd. menu ⋯). */
  menu?: ReactNode;
}

export function ReadingScreen({ view, mode, reveal, footer, actions, menu }: ReadingScreenProps) {
  const t0 = useRevealClock(reveal);
  const done = t0 === Infinity;
  const single = view.cards.length === 1;
  const [layers, setLayers] = useState(true);
  // Giữ lá đang xem khi đóng để hộp thoại vẫn có tiêu đề trong lúc chạy hoạt ảnh đóng.
  const [zoom, setZoom] = useState<ReadingCardView | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const map = view.soulMap;

  useEffect(() => {
    track('reading_viewed', { mode, firstView: reveal });
  }, [mode, reveal]);

  // Xong trình tự: bỏ ?reveal khỏi URL để F5 không chạy lại.
  useEffect(() => {
    if (!done || !reveal) return;
    const url = new URL(window.location.href);
    if (url.searchParams.has('reveal')) {
      url.searchParams.delete('reveal');
      window.history.replaceState(window.history.state, '', url.pathname + url.search);
    }
  }, [done, reveal]);

  const flipped = (i: number) => done || t0 >= (T.flip[i] ?? 0);
  const mapShown = done || t0 >= T.map;
  const titleShown = done || t0 >= T.title;
  const restShown = done || t0 >= T.rest;

  const live = useMemo(() => {
    if (!reveal) return '';
    if (done || t0 >= T.rest) return t('reading.live_ready');
    const last = view.cards.findLastIndex((_, i) => t0 >= (T.flip[i] ?? Infinity));
    return last >= 0
      ? t('reading.live_flipped', { n: last + 1, name: view.cards[last]!.name })
      : '';
  }, [reveal, done, t0, view.cards]);

  const size: CardSize = single ? 'xl' : 'md';
  const sizeLg: CardSize = single ? '2xl' : 'lg';
  const dominantLabel = AXIS_LABEL_VI[map.dominant];
  const quietLabel = AXIS_LABEL_VI[map.quiet];

  const head = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="t-caption text-ink2">
          {t('reading.date_label', { date: '' })}
          <LocalDate iso={view.createdAt} />
        </p>
        {menu}
      </div>
      <Fade shown={titleShown}>
        <h1 className="t-h1">
          <span className="block">{view.title.split(' ').slice(0, 2).join(' ')}</span>
          <span className="block text-[color:var(--accent-text)]">
            {view.title.split(' ').slice(2).join(' ')}
          </span>
        </h1>
        <p className="t-body-lg mt-3 text-ink2">{view.tagline}</p>
      </Fade>
      {mode === 'owner' && view.intention && (
        <Fade shown={titleShown}>
          <div className="rounded-lg border border-line bg-bg1 p-4">
            <p className="t-caption text-ink3">{t('reading.intention_label')}</p>
            <p className="mt-1 font-display text-ink1 italic">{view.intention}</p>
          </div>
        </Fade>
      )}
    </div>
  );

  const cards = (
    <div className={clsx('flex justify-center', single ? '' : 'gap-3 lg:gap-5')}>
      {view.cards.map((c, i) => (
        <div key={c.cardId} className="flex min-w-0 flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setZoom(c);
              setZoomOpen(true);
            }}
            aria-label={t('reading.cards.zoom_label', { name: cardVisibleLabel(face(c)) })}
            className="rounded-[10px]"
          >
            <span className="lg:hidden">
              <TarotCard
                card={face(c)}
                size={size}
                faceUp={flipped(i)}
                animateFlip={reveal}
                priority
                reversedAltSuffix={t('reading.reversed_alt_suffix')}
              />
            </span>
            <span className="hidden lg:block">
              <TarotCard
                card={face(c)}
                size={sizeLg}
                faceUp={flipped(i)}
                animateFlip={reveal}
                priority
                reversedAltSuffix={t('reading.reversed_alt_suffix')}
              />
            </span>
          </button>
          <CardCaption
            position={single ? t('reading.position_single') : c.position.label}
            name={c.name}
            orientation={
              <OrientationChip
                reversed={c.orientation === 'reversed'}
                label={orientationLabel(c)}
              />
            }
            className={clsx(
              'transition-opacity duration-300',
              flipped(i) ? 'opacity-100' : 'opacity-40',
            )}
          />
        </div>
      ))}
    </div>
  );

  const mapPanel = (
    <Surface>
      <div className="flex items-center justify-between">
        <Eyebrow>{t('reading.map.eyebrow')}</Eyebrow>
        <Popover.Root>
          <Popover.Trigger asChild>
            <IconButton aria-label={t('reading.map.info_label')} className="-mr-2">
              <Info />
            </IconButton>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              sideOffset={6}
              align="end"
              className="z-[var(--z-dialog)] max-w-[300px] rounded-lg border border-line-strong bg-bg3 p-4 text-[14px] text-ink1 shadow-[var(--shadow-card)]"
            >
              {t('reading.map.info')}
              <Popover.Arrow className="fill-[var(--bg-3)]" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <div
        className="mx-auto mt-4 w-full max-w-[420px] transition-opacity duration-300"
        style={{ opacity: mapShown ? 1 : 0 }}
      >
        {mapShown && (
          <SoulMap
            display={map.display}
            values={map.vector}
            reversed={view.cards.map((c) => c.orientation === 'reversed')}
            dominant={map.dominant}
            quiet={map.quiet}
            showLayers={layers && !single}
            animate={reveal && !done}
            title={t('reading.map.title')}
            description={t('reading.map.alt', { dominant: dominantLabel, quiet: quietLabel })}
            tableCaption={t('reading.map.table_caption')}
          />
        )}
        {!mapShown && <div className="aspect-square" />}
      </div>
      <div className="mt-6">
        <AxisMeterList
          values={map.vector}
          dominant={map.dominant}
          quiet={map.quiet}
          balanced={map.balanced}
          animate={reveal && !done}
          delayMs={Math.max(0, T.meter - (Number.isFinite(t0) ? t0 : T.meter))}
          badges={{
            dominant: t('reading.map.badge_dominant'),
            quiet: t('reading.map.badge_quiet'),
            dominantSoft: t('reading.map.badge_dominant_soft'),
            quietSoft: t('reading.map.badge_quiet_soft'),
          }}
        />
      </div>
      {!single && (
        <SwitchRow
          className="mt-4"
          label={t('reading.map.layers_toggle')}
          checked={layers}
          onCheckedChange={setLayers}
        />
      )}
    </Surface>
  );

  const body = (
    <Fade shown={restShown} className="space-y-12">
      <section aria-labelledby="cards-title" className="space-y-8">
        <Eyebrow>
          <span id="cards-title">{t('reading.cards.eyebrow')}</span>
        </Eyebrow>
        {view.cards.map((c) => (
          <article key={c.cardId} className="space-y-3">
            <h2 className="t-h3">
              {single ? t('reading.position_single') : c.position.label} · {c.name}
              {c.orientation === 'reversed' && (
                <span className="ml-2 inline-flex translate-y-[-2px] align-middle">
                  <OrientationChip reversed label={orientationLabel(c)} />
                </span>
              )}
            </h2>
            <div className="flex flex-wrap gap-2">
              {c.keywords.map((k) => (
                <KeywordChip key={k}>{k}</KeywordChip>
              ))}
            </div>
            <p className="measure text-ink1">{c.meaning}</p>
            <blockquote className="measure border-l-2 border-accent pl-4 font-display text-[18px] leading-snug text-ink1 italic">
              {c.prompt}
            </blockquote>
          </article>
        ))}
      </section>

      <section aria-labelledby="synth-title" className="space-y-4">
        <Eyebrow>
          <span id="synth-title">{t('reading.synthesis.eyebrow')}</span>
        </Eyebrow>
        <p className="measure t-body-lg text-ink1">{view.synthesis}</p>
        <ol className="space-y-3">
          {view.closingPrompts.map((p, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong font-display text-[14px] font-semibold">
                {i + 1}
              </span>
              <span className="measure font-display text-[18px] leading-snug italic">{p}</span>
            </li>
          ))}
        </ol>
      </section>

      <Disclaimer className="measure" />
      {footer}
    </Fade>
  );

  return (
    <div className="container-page pt-6 pb-10 lg:pt-10">
      <div aria-live="polite" className="sr-only">
        {live}
      </div>
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[480px_minmax(0,560px)] lg:justify-center lg:gap-x-16 lg:gap-y-10">
        <div className="lg:col-start-2 lg:row-start-1">{head}</div>
        <div className="space-y-8 lg:sticky lg:top-[88px] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
          {cards}
          {mapPanel}
        </div>
        <div className="lg:col-start-2 lg:row-start-2">{body}</div>
      </div>

      <Fade shown={restShown}>
        <ActionBar className="mt-10 lg:justify-start">
          {actions ?? (
            <ButtonLink href="/draw" size="lg" variant="secondary" full icon={<RotateCcw />}>
              {t('reading.redraw')}
            </ButtonLink>
          )}
        </ActionBar>
      </Fade>

      <SheetDialog
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        title={zoom?.name ?? ''}
        closeLabel={t('common.close')}
      >
        {zoom && (
          <div className="flex flex-col items-center gap-5 pb-2">
            <TarotCard
              card={face(zoom)}
              size="2xl"
              faceUp
              reversedAltSuffix={t('reading.reversed_alt_suffix')}
            />
            <div className="flex flex-wrap justify-center gap-2">
              <OrientationChip
                reversed={zoom.orientation === 'reversed'}
                label={orientationLabel(zoom)}
              />
              {zoom.keywords.map((k) => (
                <KeywordChip key={k}>{k}</KeywordChip>
              ))}
            </div>
          </div>
        )}
      </SheetDialog>
    </div>
  );
}
