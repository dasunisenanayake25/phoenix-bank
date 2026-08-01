import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LedgerTransactionStatus } from '../ledger.enums';

@Entity('ledger_transactions')
export class LedgerTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  reference: string;

  @Column({ name: 'transaction_type', type: 'varchar', length: 64 })
  transactionType: string;

  @Column({ type: 'enum', enum: LedgerTransactionStatus })
  status: LedgerTransactionStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ name: 'created_by', type: 'varchar', length: 64, nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'effective_at', type: 'timestamptz' })
  effectiveAt: Date;

  @Column({
    name: 'reversal_of_transaction_id',
    type: 'uuid',
    nullable: true,
  })
  reversalOfTransactionId: string | null;
}
