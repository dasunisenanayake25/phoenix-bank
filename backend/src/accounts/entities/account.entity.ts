import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CLOSED = 'CLOSED',
}

export enum AccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
  LOAN = 'LOAN',
}

@Entity('accounts')
export class Account {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Column({ name: 'customer_id', type: 'varchar', length: 64, nullable: true })
  customerId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  balance: number;

  @Column({ type: 'varchar', length: 3, default: 'LKR' })
  currency: string;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.SAVINGS })
  accountType: AccountType;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status: AccountStatus;

  @Column({ name: 'daily_limit', type: 'decimal', precision: 15, scale: 2, default: 50000.00 })
  dailyLimit: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
