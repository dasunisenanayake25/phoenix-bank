import {
  assertPositiveAmountMinor,
  parseAmountMinor,
  subtractMinor,
} from './money';

describe('money utilities', () => {
  it('parses string minor units', () => {
    expect(parseAmountMinor('500000')).toBe(500000n);
  });

  it('rejects non-digit string amounts', () => {
    expect(() => parseAmountMinor('50.5')).toThrow();
  });

  it('subtracts minor units without floating point', () => {
    expect(subtractMinor(1000n, 250n)).toBe(750n);
  });

  it('rejects zero transfer amounts', () => {
    expect(() => assertPositiveAmountMinor(0n)).toThrow();
  });
});
