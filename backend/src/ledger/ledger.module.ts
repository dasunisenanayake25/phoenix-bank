import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerAccount } from './entities/ledger-account.entity';
import { LedgerTransaction } from './entities/ledger-transaction.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { AccountBalanceProjection } from './entities/account-balance-projection.entity';
import { LedgerService } from './ledger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LedgerAccount,
      LedgerTransaction,
      LedgerEntry,
      AccountBalanceProjection,
    ]),
  ],
  providers: [LedgerService],
  exports: [LedgerService, TypeOrmModule],
})
export class LedgerModule {}
