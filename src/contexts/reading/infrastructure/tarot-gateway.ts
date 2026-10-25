/** Anti-corruption layer: file DUY NHẤT được import context tarot (quy tắc D4). */
import type { TarotPublicApi } from '@/contexts/tarot/application/public-api';
import { ok } from '@/shared/kernel/result';
import type { TarotGateway } from '../application/ports';
import type { DrawnCardSource } from '../domain';

export class TarotGatewayAdapter implements TarotGateway {
  constructor(private readonly tarot: TarotPublicApi) {}

  async drawForSpread(...args: Parameters<TarotGateway['drawForSpread']>) {
    const r = await this.tarot.drawForSpread(...args);
    if (!r.ok) return r;
    const { spread, cards } = r.value;
    return ok({
      cards: cards.map((c, i): DrawnCardSource => ({
        position: spread.positions[i]!,
        cardId: c.cardId,
        nameVi: c.nameVi,
        nameEn: c.nameEn,
        arcana: c.arcana,
        suit: c.suit,
        number: c.number,
        orientation: c.orientation,
        keywords: c.keywords[c.orientation],
        meaning: c.meaning[c.orientation],
        prompts: c.prompts[c.orientation],
        effectiveVector: c.effectiveVector,
      })),
    });
  }
}
