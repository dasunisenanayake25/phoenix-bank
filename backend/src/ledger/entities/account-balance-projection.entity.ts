import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { bigintTransformer } from '../../common/typeorm/bigint.transformer';

@Entity('account_balance_projections')
export class AccountBalanceProjection {
  @PrimaryColumn({ name: 'account_id', type: 'varchar', length: 64 })
  accountId: string;

  @Column({
    name: 'ledger_balance_minor',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  ledgerBalanceMinor: string;

  @Column({
    name: 'available_balance_minor',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  availableBalanceMinor: string;

  @Column({
    name: 'held_amount_minor',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  heldAmountMinor: string;

  @VersionColumn()
  version: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
