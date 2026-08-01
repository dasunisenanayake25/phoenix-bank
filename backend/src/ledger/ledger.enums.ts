export enum LedgerAccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum LedgerAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum LedgerEntryDirection {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum LedgerTransactionStatus {
  PENDING = 'PENDING',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
}

export type LedgerEntryDraft = {
  ledgerAccountId: string;
  direction: LedgerEntryDirection;
  amountMinor: bigint;
  currency: string;
};

export function assertBalancedEntries(entries: LedgerEntryDraft[]): void {
  if (entries.length < 2) {
    throw new Error('Ledger transaction requires at least two entries');
  }
  let debits = 0n;
  let credits = 0n;
  for (const entry of entries) {
    if (entry.amountMinor <= 0n) {
      throw new Error('Ledger entry amount must be positive');
    }
    if (entry.direction === LedgerEntryDirection.DEBIT) {
      debits += entry.amountMinor;
    } else {
      credits += entry.amountMinor;
    }
  }
  if (debits !== credits) {
    throw new Error('Ledger transaction is not balanced');
  }
}
