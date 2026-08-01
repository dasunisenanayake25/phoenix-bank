import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { bigintTransformer } from '../../common/typeorm/bigint.transformer';
import { TransferStatus } from '../transfers.enums';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 64 })
  idempotencyKey: string;

  @Column({ name: 'initiated_by_user_id', type: 'varchar', length: 64 })
  initiatedByUserId: string;

  @Column({ name: 'from_account_id', type: 'varchar', length: 64 })
  fromAccountId: string;

  @Column({ name: 'to_account_id', type: 'varchar', length: 64 })
  toAccountId: string;

  @Column({
    name: 'amount_minor',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  amountMinor: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: TransferStatus })
  status: TransferStatus;

  @Column({ name: 'ledger_transaction_id', type: 'uuid', nullable: true })
  ledgerTransactionId: string | null;

  @Column({
    name: 'failure_reason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  failureReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
