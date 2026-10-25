'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { AxisMeterList } from '@/components/soul-map/axis-meter';
import { SoulMap } from '@/components/soul-map/soul-map';
import { Button } from '@/components/ui/button';
import { Eyebrow, Surface } from '@/components/ui/misc';
import type { ReadingView } from '@/contexts/reading/application/dto';
import { AXIS_LABEL_VI } from '@/shared/kernel/axes';

type Map = ReadingView['soulMap'];

export function SoulMapDemo({ maps }: { maps: { name: string; map: Map; reversed: boolean[] }[] }) {
  const [run, setRun] = useState(0);
  return (
    <main className="container-page space-y-10 py-12">
      <div className="flex items-center justify-between">
        <h1 className="t-h1">Soul Map</h1>
        <ThemeToggle className="h-11 w-11 rounded-full border border-line-strong" />
      </div>
      <Button onClick={() => setRun((n) => n + 1)}>Vẽ lại</Button>
      <div className="grid gap-8 lg:grid-cols-3">
        {maps.map(({ name, map, reversed }) => (
          <Surface key={name}>
            <Eyebrow>{name}</Eyebrow>
            <p className="t-small mt-1 text-ink3">
              stretch ×{map.display.stretch} · {map.balanced ? 'cân bằng' : 'không cân bằng'}
            </p>
            <div className="mx-auto mt-4 max-w-[420px]" data-testid={`map-${name}`}>
              <SoulMap
                key={run}
                display={map.display}
                values={map.vector}
                reversed={reversed}
                dominant={map.dominant}
                quiet={map.quiet}
                animate={run > 0}
                title="Bản đồ linh hồn"
                description={`Trục nổi bật nhất: ${AXIS_LABEL_VI[map.dominant]}. Trục thưa nhất: ${AXIS_LABEL_VI[map.quiet]}.`}
                tableCaption="Giá trị các trục (0-100)"
              />
            </div>
            <div className="mt-6">
              <AxisMeterList
                key={run}
                values={map.vector}
                dominant={map.dominant}
                quiet={map.quiet}
                balanced={map.balanced}
                animate={run > 0}
                delayMs={200}
                badges={{
                  dominant: 'Nổi bật',
                  quiet: 'Thưa',
                  dominantSoft: 'Hơi nổi',
                  quietSoft: 'Hơi thưa',
                }}
              />
            </div>
          </Surface>
        ))}
      </div>
    </main>
  );
}
