import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEvent, ProcessedEvent } from './entities/outbox-event.entity';
import { OutboxPublisherService } from './outbox-publisher.service';

@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent, ProcessedEvent])],
  providers: [OutboxPublisherService],
  exports: [OutboxPublisherService, TypeOrmModule],
})
export class OutboxModule {}
