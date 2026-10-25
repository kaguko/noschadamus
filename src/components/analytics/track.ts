'use client';

/**
 * Gửi sự kiện analytics (docs/03 mục 9). Không chặn giao diện, nuốt mọi lỗi.
 * Tôn trọng Do Not Track / Global Privacy Control ngay từ client.
 */
type Props = Record<string, string | number | boolean>;

function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
}

export function track(name: string, props: Props = {}, opts: { beacon?: boolean } = {}): void {
  if (typeof window === 'undefined' || optedOut()) return;
  const body = JSON.stringify({ name, props });
  try {
    if (opts.beacon && navigator.sendBeacon) {
      // sendBeacon gửi kèm Origin; content-type phải là JSON để qua kiểm tra của API.
      navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }));
      return;
    }
    void fetch('/api/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // analytics không bao giờ làm hỏng trải nghiệm
  }
}
