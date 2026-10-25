'use client';

import type { RefObject } from 'react';
import { t } from '@/shared/i18n';
import type { DrawState, SpreadId } from './draw-state';
import { StepHeading } from './steps';

/** Bước 3 (xáo và chọn bài): làm ở T22. */
export function StepPick({
  headingRef,
  spreadId,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  state: DrawState;
  spreadId: SpreadId;
  onSubmitted: () => void;
}) {
  return (
    <StepHeading
      ref={headingRef}
      title={
        spreadId === 'single' ? t('draw.s3.title_pick_one') : t('draw.s3.title_pick', { count: 3 })
      }
    />
  );
}
