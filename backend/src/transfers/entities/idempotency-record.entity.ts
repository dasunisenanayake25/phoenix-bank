import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IdempotencyStatus } from '../transfers.enums';

@Entity('idempotency_records')
@Index(['key', 'userId'], { unique: true })
export class IdempotencyRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  key: string;

  @Column({ name: 'user_id', type: 'varchar', length: 64 })
  userId: string;

  @Column({ type: 'varchar', length: 120 })
  endpoint: string;

  @Column({ name: 'request_hash', type: 'varchar', length: 128 })
  requestHash: string;

  @Column({ type: 'enum', enum: IdempotencyStatus })
  status: IdempotencyStatus;

  @Column({ name: 'response_code', type: 'int', nullable: true })
  responseCode: number | null;

  @Column({ name: 'response_body', type: 'text', nullable: true })
  responseBody: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}
