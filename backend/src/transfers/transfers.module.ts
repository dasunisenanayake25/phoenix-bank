import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/account.entity';
import { LedgerModule } from '../ledger/ledger.module';
import { AuditModule } from '../audit/audit.module';
import { FraudModule } from '../fraud/fraud.module';
import { OutboxModule } from '../outbox/outbox.module';
import { Transfer } from './entities/transfer.entity';
import { IdempotencyRecord } from './entities/idempotency-record.entity';
import { TransfersController } from './controllers/transfers.controller';
import { TransfersService } from './services/transfers.service';
import { IdempotencyService } from './services/idempotency.service';
import { TransferLimitsPolicy } from './policies/transfer-limits.policy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer, IdempotencyRecord, Account]),
    LedgerModule,
    AuditModule,
    FraudModule,
    OutboxModule,
  ],
  controllers: [TransfersController],
  providers: [TransfersService, IdempotencyService, TransferLimitsPolicy],
  exports: [TransfersService],
})
export class TransfersModule {}
