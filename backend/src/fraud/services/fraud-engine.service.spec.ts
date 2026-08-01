import { FraudEngineService } from './fraud-engine.service';
import { FraudDecision } from '../../transfers/transfers.enums';

describe('FraudEngineService', () => {
  const service = new FraudEngineService();

  it('allows low-risk transfers', () => {
    const result = service.evaluate({
      fromAccountId: '1',
      toAccountId: '2',
      amountMinor: 10000n,
      dailyLimitMinor: 50_000_000n,
      perTransferLimitMinor: 5_000_000n,
    });
    expect(result.decision).toBe(FraudDecision.ALLOW);
  });

  it('rejects transfers above per-transfer limit', () => {
    const result = service.evaluate({
      fromAccountId: '1',
      toAccountId: '2',
      amountMinor: 6_000_000n,
      dailyLimitMinor: 50_000_000n,
      perTransferLimitMinor: 5_000_000n,
    });
    expect(result.decision).toBe(FraudDecision.REJECT);
    expect(result.triggeredRules).toContain('PER_TRANSFER_LIMIT_EXCEEDED');
  });
});
