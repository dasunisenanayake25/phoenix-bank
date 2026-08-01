import { Injectable } from '@nestjs/common';

export const DEFAULT_PER_TRANSFER_LIMIT_MINOR = 5_000_000n;
export const DEFAULT_DAILY_LIMIT_MINOR = 50_000_000n;

@Injectable()
export class TransferLimitsPolicy {
  getPerTransferLimitMinor(): bigint {
    const fromEnv = process.env.TRANSFER_PER_TX_LIMIT_MINOR;
    return fromEnv ? BigInt(fromEnv) : DEFAULT_PER_TRANSFER_LIMIT_MINOR;
  }

  getDailyLimitMinor(): bigint {
    const fromEnv = process.env.TRANSFER_DAILY_LIMIT_MINOR;
    return fromEnv ? BigInt(fromEnv) : DEFAULT_DAILY_LIMIT_MINOR;
  }
}
