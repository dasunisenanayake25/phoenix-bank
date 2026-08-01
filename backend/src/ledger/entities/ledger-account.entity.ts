import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LedgerAccountStatus, LedgerAccountType } from '../ledger.enums';

@Entity('ledger_accounts')
export class LedgerAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'enum', enum: LedgerAccountType })
  type: LedgerAccountType;

  @Column({ type: 'varchar', length: 3, default: 'LKR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: LedgerAccountStatus,
    default: LedgerAccountStatus.ACTIVE,
  })
  status: LedgerAccountStatus;

  @Column({
    name: 'bank_account_id',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  bankAccountId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
