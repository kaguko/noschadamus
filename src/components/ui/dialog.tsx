'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { IconButton } from './icon-button';

/**
 * docs/04 mục 7.9: một component, hai dạng.
 * < 1024px: sheet đáy, vuốt xuống để đóng (ngưỡng 80px hoặc vuốt nhanh). ≥ 1024px: hộp giữa rộng 720.
 */
export interface SheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  closeLabel: string;
  children: ReactNode;
  className?: string;
}

const CLOSE_DISTANCE = 80;
const CLOSE_VELOCITY = 0.6; // px/ms

export function SheetDialog({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  children,
  className,
}: SheetDialogProps) {
  const [dragY, setDragY] = useState(0);
  const drag = useRef<{ startY: number; startT: number } | null>(null);
  // Sheet thường mở từ nút ngoài (không phải Dialog.Trigger): tự nhớ phần tử để trả focus khi đóng.
  const returnFocus = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open && document.activeElement instanceof HTMLElement) {
      returnFocus.current = document.activeElement;
    }
  }, [open]);

  function onPointerDown(e: PointerEvent) {
    drag.current = { startY: e.clientY, startT: performance.now() };
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: PointerEvent) {
    if (!drag.current) return;
    setDragY(Math.max(0, e.clientY - drag.current.startY));
  }
  function onPointerUp(e: PointerEvent) {
    if (!drag.current) return;
    const dy = e.clientY - drag.current.startY;
    const v = dy / Math.max(1, performance.now() - drag.current.startT);
    drag.current = null;
    setDragY(0);
    if (dy > CLOSE_DISTANCE || v > CLOSE_VELOCITY) onOpenChange(false);
  }

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="nd-overlay fixed inset-0 z-[var(--z-overlay)] bg-[var(--overlay)] backdrop-blur-[8px]" />
        <RadixDialog.Content
          onCloseAutoFocus={(e) => {
            if (returnFocus.current?.isConnected) {
              e.preventDefault();
              returnFocus.current.focus();
            }
          }}
          style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
          className={clsx(
            'nd-sheet fixed z-[var(--z-dialog)] flex flex-col border border-line bg-bg1 text-ink1 shadow-[var(--shadow-card)] focus:outline-none',
            'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]',
            'lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:max-h-[88dvh] lg:w-[720px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-xl lg:pb-0',
            className,
          )}
        >
          <div
            className="flex h-6 shrink-0 cursor-grab touch-none items-start justify-center pt-2 lg:hidden"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-hidden
          >
            <span className="h-1 w-10 rounded-full bg-line-strong" />
          </div>
          <div className="flex items-start justify-between gap-4 px-5 pt-2 lg:px-8 lg:pt-7">
            <div>
              <RadixDialog.Title className="t-h2">{title}</RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="t-small mt-1 text-ink2">
                  {description}
                </RadixDialog.Description>
              ) : (
                <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <IconButton aria-label={closeLabel} className="-mt-1 -mr-2">
                <X />
              </IconButton>
            </RadixDialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-5 lg:px-8 lg:pb-8">
            {children}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
