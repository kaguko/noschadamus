'use client';

import * as RadixToast from '@radix-ui/react-toast';
import clsx from 'clsx';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

/** docs/04 mục 7.10 */
type Tone = 'info' | 'success' | 'error';
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<((message: string, tone?: Tone) => void) | null>(null);

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast cần nằm trong <ToastProvider>');
  return show;
}

const ICON = { info: Info, success: CircleCheck, error: CircleAlert } as const;

export function ToastProvider({ children, label }: { children: ReactNode; label: string }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((message: string, tone: Tone = 'info') => {
    setItems((xs) => [...xs, { id: Date.now() + Math.random(), message, tone }]);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      <RadixToast.Provider swipeDirection="down" label={label}>
        {children}
        {items.map((t) => {
          const Icon = ICON[t.tone];
          return (
            <RadixToast.Root
              key={t.id}
              type={t.tone === 'error' ? 'foreground' : 'background'}
              duration={t.tone === 'error' ? 6000 : 4000}
              onOpenChange={(open) => !open && setItems((xs) => xs.filter((x) => x.id !== t.id))}
              className={clsx(
                'nd-toast flex items-center gap-3 rounded-lg border border-line-strong bg-bg3 px-4 py-3 text-ink1 shadow-[var(--shadow-card)]',
              )}
            >
              <Icon
                aria-hidden
                className={clsx(
                  'size-5 shrink-0',
                  t.tone === 'error'
                    ? 'text-danger'
                    : t.tone === 'success'
                      ? 'text-success'
                      : 'text-accent-text',
                )}
              />
              <RadixToast.Description className="t-small">{t.message}</RadixToast.Description>
            </RadixToast.Root>
          );
        })}
        <RadixToast.Viewport
          className={clsx(
            'fixed inset-x-0 z-[var(--z-toast)] mx-auto flex w-full max-w-[420px] flex-col gap-2 px-4 outline-none',
            'bottom-[calc(16px+var(--actionbar-h,0px)+env(safe-area-inset-bottom))]',
          )}
        />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
