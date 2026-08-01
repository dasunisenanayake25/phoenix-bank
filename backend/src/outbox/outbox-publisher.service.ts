import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OutboxEvent } from './entities/outbox-event.entity';

@Injectable()
export class OutboxPublisherService implements OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private timer: NodeJS.Timeout | null = null;
  private shuttingDown = false;

  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepo: Repository<OutboxEvent>,
  ) {}

  startPolling(intervalMs = 5000): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.publishBatch();
    }, intervalMs);
  }

  onModuleDestroy(): void {
    this.shuttingDown = true;
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async publishBatch(): Promise<void> {
    if (this.shuttingDown) return;
    const pending = await this.outboxRepo.find({
      where: { publishedAt: IsNull() },
      order: { createdAt: 'ASC' },
      take: 20,
    });

    for (const event of pending) {
      try {
        // Kafka publish hook: competition stack can wire a real producer here.
        this.logger.log(
          `Publishing outbox event ${event.eventType} for ${event.aggregateId}`,
        );
        event.publishedAt = new Date();
        event.attempts += 1;
        event.lastError = null;
        await this.outboxRepo.save(event);
      } catch (err) {
        event.attempts += 1;
        event.lastError =
          err instanceof Error ? err.message : 'Unknown publish error';
        await this.outboxRepo.save(event);
      }
    }
  }
}
