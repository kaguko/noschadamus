export type SpreadId = 'single' | 'three';

export interface SpreadPosition {
  readonly index: number;
  readonly key: string;
  readonly label: { readonly vi: string };
  readonly description: { readonly vi: string };
  readonly weight: number;
}

export interface Spread {
  readonly id: SpreadId;
  readonly name: { readonly vi: string };
  readonly tagline: { readonly vi: string };
  readonly positions: readonly SpreadPosition[];
}
