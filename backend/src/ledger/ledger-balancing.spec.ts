import {
  assertBalancedEntries,
  LedgerEntryDirection,
  LedgerEntryDraft,
} from './ledger.enums';

describe('ledger balancing', () => {
  it('accepts balanced debit and credit entries', () => {
    const entries: LedgerEntryDraft[] = [
      {
        ledgerAccountId: 'a',
        direction: LedgerEntryDirection.DEBIT,
        amountMinor: 500n,
        currency: 'LKR',
      },
      {
        ledgerAccountId: 'b',
        direction: LedgerEntryDirection.CREDIT,
        amountMinor: 500n,
        currency: 'LKR',
      },
    ];
    expect(() => assertBalancedEntries(entries)).not.toThrow();
  });

  it('rejects unbalanced entries', () => {
    const entries: LedgerEntryDraft[] = [
      {
        ledgerAccountId: 'a',
        direction: LedgerEntryDirection.DEBIT,
        amountMinor: 500n,
        currency: 'LKR',
      },
      {
        ledgerAccountId: 'b',
        direction: LedgerEntryDirection.CREDIT,
        amountMinor: 499n,
        currency: 'LKR',
      },
    ];
    expect(() => assertBalancedEntries(entries)).toThrow(
      'Ledger transaction is not balanced',
    );
  });
});
