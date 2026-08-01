import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';

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

  @ManyToOne(() => Customer, (customer) => customer.accounts, {
    nullable: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({
    name: 'holder_name',
    type: 'varchar',
    length: 120,
    default: 'User',
  })
  holderName: string;

  @Column({ type: 'bigint', default: 0 })
  balance: number;

  @Column({ type: 'varchar', length: 3, default: 'LKR' })
  currency: string;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.SAVINGS })
  accountType: AccountType;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status: AccountStatus;

  @Column({
    name: 'daily_limit',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 50000.0,
  })
  dailyLimit: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
