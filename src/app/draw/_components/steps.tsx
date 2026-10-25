'use client';

import { Heart } from 'lucide-react';
import { forwardRef } from 'react';
import { SpreadOptionGroup } from '@/components/ui/spread-option';
import { SwitchRow } from '@/components/ui/switch';
import { CountedTextarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { INTENTION_MAX_CHARS } from './limits';
import { t } from '@/shared/i18n';
import { mentionsCrisis } from '@/shared/safety/crisis-terms';
import type { DrawAction, DrawState } from './draw-state';

/** Tiêu đề bước nhận focus khi đổi bước (cho trình đọc màn hình). */
export const StepHeading = forwardRef<HTMLHeadingElement, { title: string; subtitle?: string }>(
  function StepHeading({ title, subtitle }, ref) {
    return (
      <div className="space-y-2">
        <h1 ref={ref} tabIndex={-1} className="t-h1 outline-none">
          {title}
        </h1>
        {subtitle && <p className="text-ink2">{subtitle}</p>}
      </div>
    );
  },
);

export function StepSpread({
  state,
  dispatch,
}: {
  state: DrawState;
  dispatch: (a: DrawAction) => void;
}) {
  return (
    <SpreadOptionGroup
      label={t('draw.s1.group_label')}
      value={state.spreadId}
      onChange={(spreadId) => dispatch({ type: 'selectSpread', spreadId })}
      items={[
        {
          value: 'single',
          name: t('draw.s1.single_name'),
          tagline: t('draw.s1.single_tagline'),
          time: t('draw.s1.single_time'),
          cards: 1,
        },
        {
          value: 'three',
          name: t('draw.s1.three_name'),
          tagline: t('draw.s1.three_tagline'),
          time: t('draw.s1.three_time'),
          cards: 3,
        },
      ]}
    />
  );
}

export function StepIntention({
  state,
  dispatch,
}: {
  state: DrawState;
  dispatch: (a: DrawAction) => void;
}) {
  const toast = useToast();
  const hasText = state.intention.trim().length > 0;
  // Phát hiện chỉ ở client; không gửi đi, không ghi log (docs/05 mục 2.2).
  const care = mentionsCrisis(state.intention);
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="intention" className="sr-only">
          {t('draw.s2.field_label')}
        </label>
        <CountedTextarea
          id="intention"
          value={state.intention}
          onValueChange={(value) => dispatch({ type: 'setIntention', value })}
          max={INTENTION_MAX_CHARS}
          onTruncate={() => toast(t('draw.s2.truncated_toast'))}
          placeholder={t('draw.s2.placeholder')}
          autoComplete="off"
          spellCheck={false}
        />
        {care && (
          <div
            role="note"
            className="mt-3 flex gap-3 rounded-lg border border-line bg-bg2 p-4 text-ink1"
            data-testid="care-note"
          >
            <Heart aria-hidden className="mt-0.5 size-5 shrink-0 text-axis-emotion" />
            <p className="t-small">{t('draw.s2.care')}</p>
          </div>
        )}
      </div>
      <div className="divide-y divide-line">
        <SwitchRow
          label={t('draw.s2.store_label')}
          help={t('draw.s2.store_help')}
          checked={state.storeIntention}
          onCheckedChange={(value) => dispatch({ type: 'setStore', value })}
          disabled={!hasText}
        />
        <SwitchRow
          label={t('draw.s2.reversed_label')}
          help={t('draw.s2.reversed_help')}
          checked={state.allowReversed}
          onCheckedChange={(value) => dispatch({ type: 'setReversed', value })}
        />
      </div>
    </div>
  );
}
