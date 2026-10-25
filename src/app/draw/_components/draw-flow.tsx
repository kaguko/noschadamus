'use client';

import { ArrowLeft } from 'lucide-react';
import { useEffect, useReducer, useRef, useSyncExternalStore } from 'react';
import { track } from '@/components/analytics/track';
import { ActionBar } from '@/components/layout/site-chrome';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Stepper } from '@/components/ui/stepper';
import { t } from '@/shared/i18n';
import {
  abandonedStep,
  drawReducer,
  INITIAL_DRAW,
  loadDraft,
  saveDraft,
  type DrawState,
} from './draw-state';
import { StepPick } from './step-pick';
import { StepHeading, StepIntention, StepSpread } from './steps';

const noop = () => () => {};

/** Đọc bản nháp sau khi hydrate để server và client khớp nhau (server luôn là bước 1). */
export function DrawFlow() {
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  return (
    <DrawMachine
      key={hydrated ? 'client' : 'server'}
      initial={hydrated ? loadDraft() : INITIAL_DRAW}
      persist={hydrated}
    />
  );
}

/** `persist` = false ở lần render khớp server: không được ghi đè bản nháp trước khi đọc nó. */
function DrawMachine({ initial, persist }: { initial: DrawState; persist: boolean }) {
  const [state, dispatch] = useReducer(drawReducer, initial);
  const heading = useRef<HTMLHeadingElement>(null);
  const submitted = useRef(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (persist) saveDraft(state);
  }, [state, persist]);

  // Đổi bước: đưa focus về tiêu đề mới (không làm khi vừa vào trang).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
    window.scrollTo({ top: 0 });
  }, [state.step]);

  // Rời trang giữa chừng → reading_abandoned (sendBeacon).
  const stepRef = useRef(state.step);
  useEffect(() => {
    stepRef.current = state.step;
  }, [state.step]);
  useEffect(() => {
    const onHide = () => {
      if (!submitted.current)
        track('reading_abandoned', { step: abandonedStep(stepRef.current) }, { beacon: true });
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, []);

  function next() {
    if (state.step === 1 && state.spreadId) track('spread_selected', { spreadId: state.spreadId });
    if (state.step === 2)
      track('intention_entered', { hasText: state.intention.trim().length > 0 });
    dispatch({ type: 'next' });
  }

  const label = t('draw.step_label', { current: state.step, total: 3 });

  return (
    <div className="container-page max-w-[880px] pt-4 pb-10 lg:pt-8">
      <div className="flex items-end gap-3">
        {state.step > 1 && (
          <IconButton
            aria-label={t('draw.back')}
            onClick={() => dispatch({ type: 'back' })}
            className="-ml-2"
          >
            <ArrowLeft />
          </IconButton>
        )}
        <div className="flex-1">
          <Stepper current={state.step} total={3} label={label} />
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {state.step === 1 && (
          <>
            <StepHeading
              ref={heading}
              title={t('draw.s1.title')}
              subtitle={t('draw.s1.subtitle')}
            />
            <StepSpread state={state} dispatch={dispatch} />
            <ActionBar className="lg:justify-end">
              <Button
                size="lg"
                full
                className="lg:w-auto lg:min-w-48"
                disabled={!state.spreadId}
                onClick={next}
              >
                {t('draw.next')}
              </Button>
            </ActionBar>
          </>
        )}

        {state.step === 2 && (
          <>
            <StepHeading
              ref={heading}
              title={t('draw.s2.title')}
              subtitle={t('draw.s2.subtitle')}
            />
            <StepIntention state={state} dispatch={dispatch} />
            <ActionBar className="lg:justify-end">
              <Button size="lg" full className="lg:w-auto lg:min-w-48" onClick={next}>
                {state.intention.trim() ? t('draw.next') : t('draw.s2.skip')}
              </Button>
            </ActionBar>
          </>
        )}

        {state.step === 3 && state.spreadId && (
          <StepPick
            headingRef={heading}
            state={state}
            spreadId={state.spreadId}
            onSubmitted={() => {
              submitted.current = true;
            }}
          />
        )}
      </div>
    </div>
  );
}
