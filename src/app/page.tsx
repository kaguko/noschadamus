import type { Metadata } from 'next';
import Link from 'next/link';
import { AxisChip } from '@/components/ui/chip';
import { DisclosureList } from '@/components/ui/disclosure-list';
import { Eyebrow, Skeleton, Surface } from '@/components/ui/misc';
import {
  GOLDEN_EXAMPLE_ITEMS,
  soulMapPreview,
} from '@/contexts/reading/application/soul-map-preview';
import { AXIS_LABEL_VI, AXIS_ORDER } from '@/shared/kernel/axes';
import { t } from '@/shared/i18n';
import { HeroVisual } from './_landing/hero-visual';
import { DrawCta, LandingView, SampleMap } from './_landing/landing-islands';

export const metadata: Metadata = {
  title: { absolute: t('landing.meta_title') },
  description: t('landing.meta_description'),
  alternates: { canonical: '/' },
};

const SAMPLE_MAP = soulMapPreview(GOLDEN_EXAMPLE_ITEMS);

const STEPS = [
  ['landing.how.s1_title', 'landing.how.s1_body'],
  ['landing.how.s2_title', 'landing.how.s2_body'],
  ['landing.how.s3_title', 'landing.how.s3_body'],
] as const;

const FAQ = ([1, 2, 3, 4, 5] as const).map((i) => ({
  q: t(`landing.faq.q${i}`),
  a: t(`landing.faq.a${i}`),
}));

const MOCKUPS = [
  { key: 'landing.share.story', ratio: '9 / 16', width: 'w-[200px] lg:w-[240px]' },
  { key: 'landing.share.post', ratio: '4 / 5', width: 'w-[240px] lg:w-[300px]' },
  { key: 'landing.share.link', ratio: '1200 / 630', width: 'w-[300px] lg:w-[420px]' },
] as const;

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'noschadamus',
  inLanguage: 'vi',
  description: t('landing.meta_description'),
};

export default function LandingPage() {
  return (
    <>
      <LandingView />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Hero */}
      <section className="container-page grid items-center gap-8 pt-8 pb-12 lg:grid-cols-[1.25fr_1fr] lg:gap-12 lg:pt-16 lg:pb-24">
        <div className="min-w-0">
          <Eyebrow>{t('landing.eyebrow')}</Eyebrow>
          <h1 className="t-display mt-4">
            {/* Mỗi câu một khối, tự cân dòng: tránh rớt một chữ lẻ xuống dòng. */}
            <span className="block [text-wrap:balance]">{t('landing.title_line1')}</span>
            <span className="block [text-wrap:balance]">{t('landing.title_line2')}</span>
          </h1>
          <p className="t-body-lg mt-5 max-w-[34ch] text-ink2">{t('landing.subtitle')}</p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="sm:min-w-60 [&>a]:w-full">
              <DrawCta />
            </div>
            <Link
              href="#how"
              className="rounded-full px-4 py-3 text-center font-semibold text-ink2 hover:text-ink1"
            >
              {t('landing.how_link')} →
            </Link>
          </div>
        </div>
        <HeroVisual map={SAMPLE_MAP} />
      </section>

      {/* Cách hoạt động */}
      <section id="how" className="container-page scroll-mt-24 py-16 lg:py-24">
        <Eyebrow>{t('landing.how.eyebrow')}</Eyebrow>
        <h2 className="t-h2 mt-3">{t('landing.how.title')}</h2>
        <ol className="mt-8 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="flex gap-4 lg:flex-col">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong font-display font-semibold text-ink1">
                {i + 1}
              </span>
              <div>
                <h3 className="t-h3">{t(title)}</h3>
                <p className="mt-1 text-ink2">{t(body)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Một bản đồ, sáu trục */}
      <section className="container-page py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <SampleMap map={SAMPLE_MAP} />
          <div>
            <Eyebrow>{t('landing.map.eyebrow')}</Eyebrow>
            <h2 className="t-h2 mt-3">{t('landing.map.title')}</h2>
            <p className="measure mt-4 text-ink2">{t('landing.map.body')}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {AXIS_ORDER.map((a) => (
                <AxisChip key={a} axis={a}>
                  {AXIS_LABEL_VI[a]}
                </AxisChip>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ảnh đáng đăng (ảnh thật thay ở T28) */}
      <section className="py-16 lg:py-24">
        <div className="container-page">
          <Eyebrow>{t('landing.share.eyebrow')}</Eyebrow>
          <h2 className="t-h2 mt-3">{t('landing.share.title')}</h2>
          <p className="measure mt-4 text-ink2">{t('landing.share.body')}</p>
        </div>
        <ul
          tabIndex={0}
          aria-label={t('landing.share.gallery_label')}
          className="container-page mt-8 flex snap-x snap-mandatory items-end gap-5 overflow-x-auto pb-4 [scrollbar-width:none]"
        >
          {MOCKUPS.map((m) => (
            <li key={m.key} className={`shrink-0 snap-center ${m.width}`}>
              <Skeleton
                className="w-full rounded-xl border border-line"
                style={{ aspectRatio: m.ratio }}
              />
              <p className="t-small mt-2 text-center text-ink3">{t(m.key)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="container-page py-16 lg:py-24">
        <div className="mx-auto max-w-[720px]">
          <Eyebrow>{t('landing.faq.eyebrow')}</Eyebrow>
          <div className="mt-6">
            <DisclosureList items={FAQ} name="faq" />
          </div>
        </div>
      </section>

      {/* CTA cuối */}
      <section className="container-page pt-8 pb-8">
        <Surface className="mx-auto max-w-[720px] text-center">
          <h2 className="t-h2">{t('landing.final.title')}</h2>
          <p className="mt-2 text-ink2">{t('landing.final.body')}</p>
          <div className="mt-6 flex justify-center">
            <DrawCta />
          </div>
        </Surface>
      </section>
    </>
  );
}
