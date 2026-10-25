'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/components/analytics/track';
import { SoulMap } from '@/components/soul-map/soul-map';
import { ButtonLink, type ButtonSize } from '@/components/ui/button';
import type { ReadingView } from '@/contexts/reading/application/dto';
import { AXIS_LABEL_VI } from '@/shared/kernel/axes';
import { t } from '@/shared/i18n';

/** Gửi landing_view một lần khi vào trang (ref=share nếu đến từ liên kết chia sẻ). */
export function LandingView() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    track('landing_view', {
      ref: ref === 'share' ? 'share' : document.referrer ? 'other' : 'direct',
    });
  }, []);
  return null;
}

export function DrawCta({ size = 'lg', full = false }: { size?: ButtonSize; full?: boolean }) {
  return (
    <ButtonLink href="/draw" size={size} full={full} onClick={() => track('draw_started')}>
      {t('landing.cta')}
    </ButtonLink>
  );
}

/** Soul Map mẫu: vẽ một lần khi cuộn vào khung nhìn. */
export function SampleMap({ map }: { map: ReadingView['soulMap'] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="mx-auto w-full max-w-[300px] transition-opacity duration-[var(--dur-slow)] lg:max-w-[420px]"
      style={{ opacity: inView ? 1 : 0 }}
    >
      <SoulMap
        display={map.display}
        values={map.vector}
        reversed={[false, false, true]}
        dominant={map.dominant}
        quiet={map.quiet}
        animate={inView}
        title={t('reading.map.title')}
        description={t('reading.map.alt', {
          dominant: AXIS_LABEL_VI[map.dominant],
          quiet: AXIS_LABEL_VI[map.quiet],
        })}
        tableCaption={t('reading.map.table_caption')}
      />
    </div>
  );
}
