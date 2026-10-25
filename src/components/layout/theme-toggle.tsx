'use client';

import { useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY, type Theme } from './theme';

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'dark' as Theme);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // bộ nhớ trình duyệt bị chặn: vẫn đổi theme cho phiên này
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={className}
      aria-label={next === 'light' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}
