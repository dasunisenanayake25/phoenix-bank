import { Injectable } from '@nestjs/common';
import { FraudDecision } from '../../transfers/transfers.enums';

export type FraudEvaluationInput = {
  fromAccountId: string;
  toAccountId: string;
  amountMinor: bigint;
  dailyTotalMinor?: bigint;
  dailyLimitMinor: bigint;
  perTransferLimitMinor: bigint;
  isNewBeneficiary?: boolean;
  failedLoginCount?: number;
};

export type FraudEvaluationResult = {
  riskScore: number;
  decision: FraudDecision;
  triggeredRules: string[];
  modelVersion: string;
  evaluatedAt: Date;
};

@Injectable()
export class FraudEngineService {
  evaluate(input: FraudEvaluationInput): FraudEvaluationResult {
    const triggeredRules: string[] = [];
    let riskScore = 0.1;

    if (input.amountMinor > input.perTransferLimitMinor) {
      triggeredRules.push('PER_TRANSFER_LIMIT_EXCEEDED');
      riskScore = Math.max(riskScore, 0.95);
    }

    if (input.amountMinor > 20_000_000n) {
      triggeredRules.push('UNUSUALLY_HIGH_TRANSFER');
      riskScore = Math.max(riskScore, 0.85);
    }

    if (input.isNewBeneficiary) {
      triggeredRules.push('NEW_BENEFICIARY');
      riskScore = Math.max(riskScore, 0.55);
    }

    const dailyTotal = input.dailyTotalMinor ?? 0n;
    if (dailyTotal + input.amountMinor >= input.dailyLimitMinor) {
      triggeredRules.push('NEAR_DAILY_LIMIT');
      riskScore = Math.max(riskScore, 0.7);
    }

    if ((input.failedLoginCount ?? 0) >= 3) {
      triggeredRules.push('REPEATED_FAILED_LOGINS');
      riskScore = Math.max(riskScore, 0.6);
    }

    let decision = FraudDecision.ALLOW;
    if (triggeredRules.includes('PER_TRANSFER_LIMIT_EXCEEDED')) {
      decision = FraudDecision.REJECT;
    } else if (riskScore >= 0.85) {
      decision = FraudDecision.HOLD_FOR_REVIEW;
    } else if (riskScore >= 0.65) {
      decision = FraudDecision.REQUIRE_STEP_UP_MFA;
    }

    return {
      riskScore: Number(riskScore.toFixed(3)),
      decision,
      triggeredRules,
      modelVersion: 'hybrid-v1',
      evaluatedAt: new Date(),
    };
  }
}
