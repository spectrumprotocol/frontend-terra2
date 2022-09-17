export const CONFIG = {
  DIGIT: 6,
  UNIT: 1000000,  // 10^DIGIT
  TERRASWAP_COMMISSION: '0.003', // https://docs.terraswap.io/docs/introduction/trading_fees/
  ASTROPORT_XYK_COMMISSION: '0.002', // 0.001 for xASTRO holder https://docs.astroport.fi/astroport/tokenomics/astroport-tokenomics/fees
  ASTROPORT_STABLE_COMMISSION: '0.00025', // 0.00025 for xASTRO stakers
  ASTROPORT_XYK_COMMISSION_TOTAL: '0.003',
  ASTROPORT_STABLE_COMMISSION_TOTAL: '0.0005',
  GOOGLE_ANALYTICS_ID: 'G-F7M9C5B1BY',
  SLIPPAGE_TOLERANCE: '0.01',
  COMPOUND_TIMES_PER_YEAR: 365,
  BOND_ASSETS_MIN_RECEIVE_SLIPPAGE_TOLERANCE: 0.01,
};
