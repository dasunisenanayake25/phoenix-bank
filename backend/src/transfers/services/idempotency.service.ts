import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyRecord } from '../entities/idempotency-record.entity';
import { IdempotencyStatus } from '../transfers.enums';

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectRepository(IdempotencyRecord)
    private readonly repo: Repository<IdempotencyRecord>,
  ) {}

  hashRequest(payload: unknown): string {
    return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  async begin(
    key: string,
    userId: string,
    endpoint: string,
    requestHash: string,
  ): Promise<
    | { type: 'replay'; record: IdempotencyRecord }
    | { type: 'conflict' }
    | { type: 'new'; record: IdempotencyRecord }
  > {
    const existing = await this.repo.findOne({ where: { key, userId } });
    if (existing) {
      if (existing.requestHash !== requestHash) {
        return { type: 'conflict' };
      }
      if (existing.status === IdempotencyStatus.COMPLETED) {
        return { type: 'replay', record: existing };
      }
      return { type: 'new', record: existing };
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const record = await this.repo.save(
      this.repo.create({
        key,
        userId,
        endpoint,
        requestHash,
        status: IdempotencyStatus.IN_PROGRESS,
        responseCode: null,
        responseBody: null,
        expiresAt,
      }),
    );
    return { type: 'new', record };
  }

  async complete(
    recordId: string,
    responseCode: number,
    responseBody: string,
  ): Promise<void> {
    await this.repo.update(recordId, {
      status: IdempotencyStatus.COMPLETED,
      responseCode,
      responseBody,
    });
  }

  async fail(recordId: string): Promise<void> {
    await this.repo.update(recordId, {
      status: IdempotencyStatus.FAILED,
    });
  }
}
