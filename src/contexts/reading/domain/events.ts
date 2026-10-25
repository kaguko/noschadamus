import type { AxisId } from '@/shared/kernel/axes';

/** Sự kiện miền: không chứa dữ liệu nhận dạng, không chứa ý niệm (docs/01 mục 3.6). */
export interface ReadingCreated {
  readonly type: 'ReadingCreated';
  readonly readingId: string;
  readonly spreadId: string;
  readonly allowReversed: boolean;
  readonly dominant: AxisId;
  readonly occurredAt: Date;
}

export interface ReadingShared {
  readonly type: 'ReadingShared';
  readonly readingId: string;
  readonly occurredAt: Date;
}

export interface ShareRevoked {
  readonly type: 'ShareRevoked';
  readonly readingId: string;
  readonly occurredAt: Date;
}

export type DomainEvent = ReadingCreated | ReadingShared | ShareRevoked;
