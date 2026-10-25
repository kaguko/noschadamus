'use client';

import { Download, Share2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Accordion } from '@/components/ui/accordion';
import { Button, ButtonLink } from '@/components/ui/button';
import { AxisChip, Chip, KeywordChip, OrientationChip } from '@/components/ui/chip';
import { SheetDialog } from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { EmptyState, Eyebrow, Skeleton, SkeletonText, Surface } from '@/components/ui/misc';
import { SpreadOptionGroup } from '@/components/ui/spread-option';
import { Stepper } from '@/components/ui/stepper';
import { SwitchRow } from '@/components/ui/switch';
import { TabPanel, Tabs } from '@/components/ui/tabs';
import { CountedTextarea } from '@/components/ui/textarea';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { AXIS_LABEL_VI, AXIS_ORDER } from '@/shared/kernel/axes';

/** Trang liệt kê component (chỉ dev): docs/07 T16. Chuỗi ở đây là dữ liệu mẫu, không phải chuỗi giao diện thật. */
export function DevUi() {
  return (
    <ToastProvider label="Thông báo">
      <Showcase />
    </ToastProvider>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4" aria-label={title}>
      <h2 className="t-h2">{title}</h2>
      {children}
    </section>
  );
}

function Showcase() {
  const toast = useToast();
  const [spread, setSpread] = useState<'single' | 'three' | null>(null);
  const [text, setText] = useState('');
  const [store, setStore] = useState(false);
  const [rev, setRev] = useState(true);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'story' | 'post' | 'link'>('story');
  const [step, setStep] = useState(1);

  return (
    <main className="container-page space-y-16 py-12">
      <div className="flex items-center justify-between">
        <h1 className="t-h1">UI kit</h1>
        <ThemeToggle className="h-11 w-11 rounded-full border border-line-strong" />
      </div>

      <Section title="Button">
        {(['primary', 'secondary', 'ghost', 'danger'] as const).map((v) => (
          <div key={v} className="flex flex-wrap items-center gap-3">
            <Button variant={v} size="sm">
              Nhỏ
            </Button>
            <Button variant={v} icon={<Sparkles />}>
              Vừa
            </Button>
            <Button variant={v} size="lg">
              Lớn
            </Button>
            <Button variant={v} loading>
              Đang tải
            </Button>
            <Button variant={v} disabled>
              Tắt
            </Button>
          </div>
        ))}
        <Button full size="lg">
          Rút bài ngay
        </Button>
        <ButtonLink href="/dev/tokens" variant="secondary">
          Liên kết dạng nút
        </ButtonLink>
        <div className="flex gap-2">
          <IconButton aria-label="Chia sẻ">
            <Share2 />
          </IconButton>
          <IconButton aria-label="Tải xuống">
            <Download />
          </IconButton>
        </div>
      </Section>

      <Section title="Chip">
        <div className="flex flex-wrap gap-2">
          <Chip>Trung tính</Chip>
          <KeywordChip>Khởi đầu</KeywordChip>
          <OrientationChip reversed={false} label="Xuôi" />
          <OrientationChip reversed label="Ngược" />
          {AXIS_ORDER.map((a) => (
            <AxisChip key={a} axis={a}>
              {AXIS_LABEL_VI[a]}
            </AxisChip>
          ))}
        </div>
      </Section>

      <Section title="Stepper">
        <Stepper current={step} total={3} label={`BƯỚC ${step}/3`} />
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))}>
            Lùi
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setStep((s) => Math.min(3, s + 1))}>
            Tiến
          </Button>
        </div>
      </Section>

      <Section title="SpreadOption">
        <SpreadOptionGroup
          label="Chọn trải bài"
          value={spread}
          onChange={setSpread}
          items={[
            {
              value: 'single',
              name: 'Một lá',
              tagline: 'Điều cần lắng nghe hôm nay',
              time: 'Khoảng 1 phút',
              cards: 1,
            },
            {
              value: 'three',
              name: 'Ba lá',
              tagline: 'Quá khứ · Hiện tại · Hướng mở',
              time: 'Khoảng 2 phút',
              cards: 3,
            },
          ]}
        />
      </Section>

      <Section title="Textarea + Switch">
        <label htmlFor="dev-intention" className="sr-only">
          Ý niệm
        </label>
        <CountedTextarea
          id="dev-intention"
          value={text}
          onValueChange={(v) => {
            setText(v);
            if (!v.trim()) setStore(false);
          }}
          max={280}
          onTruncate={() => toast('Đã cắt bớt cho vừa 280 ký tự.')}
          placeholder="Ví dụ: Mình đang phân vân về một lựa chọn…"
        />
        <SwitchRow
          label="Lưu ý niệm này cùng bản đọc"
          help="Chỉ bạn xem được trên thiết bị này."
          checked={store}
          onCheckedChange={setStore}
          disabled={!text.trim()}
        />
        <SwitchRow
          label="Bao gồm bài ngược"
          help="Một số lá có thể xuất hiện ngược."
          checked={rev}
          onCheckedChange={setRev}
        />
      </Section>

      <Section title="Toast">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => toast('Đã sao chép liên kết.', 'success')}>
            Thành công
          </Button>
          <Button variant="secondary" onClick={() => toast('Có vẻ bạn đang ngoại tuyến.', 'error')}>
            Lỗi
          </Button>
        </div>
      </Section>

      <Section title="Dialog / Sheet + Tabs">
        <Button onClick={() => setOpen(true)}>Mở chia sẻ</Button>
        <SheetDialog
          open={open}
          onOpenChange={setOpen}
          title="Chia sẻ bản đồ của bạn"
          closeLabel="Đóng"
        >
          <Tabs
            label="Định dạng"
            value={tab}
            onValueChange={setTab}
            tabs={[
              { value: 'story', label: 'Story' },
              { value: 'post', label: 'Bài đăng' },
              { value: 'link', label: 'Liên kết' },
            ]}
          >
            {(['story', 'post', 'link'] as const).map((t) => (
              <TabPanel key={t} value={t} className="pt-4">
                <Skeleton className="mx-auto h-64 w-40" />
              </TabPanel>
            ))}
          </Tabs>
          <div className="mt-5 grid gap-3">
            <Button full size="lg" icon={<Share2 />}>
              Chia sẻ ảnh
            </Button>
            <Button full size="lg" variant="secondary" icon={<Download />}>
              Tải ảnh xuống
            </Button>
          </div>
        </SheetDialog>
      </Section>

      <Section title="Accordion">
        <Accordion
          items={[
            { q: 'Có đoán đúng tương lai không?', a: 'Không, và chúng tôi không cố làm vậy.' },
            { q: 'Bạn lưu gì về tôi?', a: 'Không cần tài khoản.' },
          ]}
        />
      </Section>

      <Section title="Surface, Skeleton, EmptyState">
        <Surface>
          <Eyebrow>Bản đồ linh hồn</Eyebrow>
          <Skeleton className="mx-auto mt-4 aspect-square w-48 rounded-full" />
          <div className="mt-4">
            <SkeletonText />
          </div>
        </Surface>
        <EmptyState
          title="Chưa có bản đọc nào"
          body="Khi bạn rút bài, các bản đọc sẽ nằm ở đây."
          action={<Button>Rút bài</Button>}
        />
      </Section>
    </main>
  );
}
