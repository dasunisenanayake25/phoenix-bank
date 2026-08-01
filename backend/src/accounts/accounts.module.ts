import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';
import { TransfersModule } from '../transfers/transfers.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), LedgerModule, TransfersModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
