import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { bigintTransformer } from '../../common/typeorm/bigint.transformer';
import { LedgerEntryDirection } from '../ledger.enums';

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ledger_transaction_id', type: 'uuid' })
  ledgerTransactionId: string;

  @Column({ name: 'ledger_account_id', type: 'uuid' })
  ledgerAccountId: string;

  @Column({ type: 'enum', enum: LedgerEntryDirection })
  direction: LedgerEntryDirection;

  @Column({
    name: 'amount_minor',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  amountMinor: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
