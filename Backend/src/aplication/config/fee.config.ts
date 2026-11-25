export const FEE_CONFIG = Symbol('FEE_CONFIG');

export interface FeeConfig {
  baseFeeInCents: number;
  deliveryFeeInCents: number;
}