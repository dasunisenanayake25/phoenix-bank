import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { AuditLog } from './entities/audit-log.entity';

export type AuditEventInput = {
  actorType: string;
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  result: string;
  sourceIp?: string;
  userAgent?: string;
  deviceId?: string;
  correlationId?: string;
};

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async record(event: AuditEventInput): Promise<void> {
    const previous = await this.auditRepo.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });
    const previousHash = previous[0]?.eventHash ?? null;
    const payload = JSON.stringify({
      ...event,
      previousHash,
      timestamp: new Date().toISOString(),
    });
    const eventHash = createHash('sha256').update(payload).digest('hex');
    await this.auditRepo.save(
      this.auditRepo.create({
        ...event,
        targetType: event.targetType ?? null,
        targetId: event.targetId ?? null,
        sourceIp: event.sourceIp ?? null,
        userAgent: event.userAgent ?? null,
        deviceId: event.deviceId ?? null,
        correlationId: event.correlationId ?? null,
        previousHash,
        eventHash,
      }),
    );
  }
}
