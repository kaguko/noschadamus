'use client';

import { useEffect, useState } from 'react';
import { t } from '@/shared/i18n';

const COOKIE_NOTE_KEY = 'nd:cookie-note-seen';

/** Hiện dòng thông báo cookie ở lần ghé đầu (docs/05 mục 10). */
export function CookieNote() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(COOKIE_NOTE_KEY) === '1';
      localStorage.setItem(COOKIE_NOTE_KEY, '1');
    } catch {
      // bộ nhớ bị chặn: vẫn hiện
    }
    if (!seen) {
      const id = window.setTimeout(() => setShow(true), 0);
      return () => window.clearTimeout(id);
    }
  }, []);
  return show ? <p className="t-small mt-3 text-ink3">{t('footer.cookie_note')}</p> : null;
}
