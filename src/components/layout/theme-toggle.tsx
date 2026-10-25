'use client';

import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { IconButton } from '@/components/ui/icon-button';
import { t } from '@/shared/i18n';
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
    <IconButton
      onClick={toggle}
      className={className}
      aria-label={next === 'light' ? t('header.theme_to_light') : t('header.theme_to_dark')}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </IconButton>
  );
}
