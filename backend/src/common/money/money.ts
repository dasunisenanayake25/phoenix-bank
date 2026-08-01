export const SUPPORTED_CURRENCIES = ['LKR'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyError';
  }
}

export function parseAmountMinor(value: string | bigint | number): bigint {
  if (typeof value === 'bigint') {
    if (value < 0n) {
      throw new MoneyError('Amount must be non-negative');
    }
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
      throw new MoneyError(
        'Amount must be a non-negative integer in minor units',
      );
    }
    return BigInt(value);
  }
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new MoneyError('Amount must be a string of minor units digits');
  }
  return BigInt(trimmed);
}

export function assertPositiveAmountMinor(amountMinor: bigint): void {
  if (amountMinor <= 0n) {
    throw new MoneyError('Amount must be greater than zero');
  }
}

export function assertSupportedCurrency(
  currency: string,
): asserts currency is SupportedCurrency {
  if (!SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)) {
    throw new MoneyError(`Unsupported currency: ${currency}`);
  }
}

export function addMinor(a: bigint, b: bigint): bigint {
  return a + b;
}

export function subtractMinor(a: bigint, b: bigint): bigint {
  if (a < b) {
    throw new MoneyError('Insufficient funds');
  }
  return a - b;
}

export function compareMinor(a: bigint, b: bigint): number {
  if (a === b) return 0;
  return a > b ? 1 : -1;
}

export function minorToDisplay(
  amountMinor: bigint,
  currency: SupportedCurrency,
): string {
  const major = amountMinor / 100n;
  const minor = amountMinor % 100n;
  const minorStr = minor.toString().padStart(2, '0');
  return `${currency} ${major.toLocaleString('en-US')}.${minorStr}`;
}
