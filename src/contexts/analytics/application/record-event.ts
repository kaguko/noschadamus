import type { Clock } from '@/shared/kernel/clock';

/** Danh sách sự kiện cho phép (docs/03 mục 9). Không có dữ liệu nhận dạng, không có nội dung ý niệm. */
export const EVENT_NAMES = [
  'landing_view',
  'draw_started',
  'spread_selected',
  'intention_entered',
  'cards_picked',
  'reading_created',
  'reading_viewed',
  'share_opened',
  'share_image_downloaded',
  'share_native_used',
  'share_link_created',
  'share_link_revoked',
  'shared_view_cta_clicked',
  'reading_abandoned',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

/** Chỉ server được phát (qua sự kiện miền); client gửi lên sẽ bị từ chối. */
export const SERVER_ONLY_EVENTS: ReadonlySet<EventName> = new Set(['reading_created']);

export type EventProps = Readonly<Record<string, string | number | boolean>>;

export interface AnalyticsEventRecord {
  readonly name: EventName;
  readonly occurredAt: Date;
  readonly visitorHash: string;
  readonly props: EventProps;
}

export interface EventStore {
  append(e: AnalyticsEventRecord): Promise<void>;
  deleteOlderThan(cutoff: Date): Promise<number>;
}

/** Thời hạn lưu sự kiện: 400 ngày (docs/03 mục 5). */
export const EVENT_RETENTION_DAYS = 400;

export class RecordEvent {
  constructor(private readonly deps: { store: EventStore; clock: Clock }) {}

  async execute(input: { name: EventName; props: EventProps; visitorHash: string }) {
    await this.deps.store.append({ ...input, occurredAt: this.deps.clock.now() });
  }
}

export class PurgeEvents {
  constructor(private readonly deps: { store: EventStore; clock: Clock }) {}

  async execute(): Promise<number> {
    const now = this.deps.clock.now();
    return this.deps.store.deleteOlderThan(
      new Date(now.getTime() - EVENT_RETENTION_DAYS * 86_400_000),
    );
  }
}
