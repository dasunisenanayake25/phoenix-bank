import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FraudDecision } from '../../transfers/transfers.enums';

@Entity('fraud_cases')
export class FraudCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transfer_id', type: 'uuid' })
  transferId: string;

  @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 3 })
  riskScore: string;

  @Column({ type: 'enum', enum: FraudDecision })
  decision: FraudDecision;

  @Column({ name: 'triggered_rules', type: 'jsonb', default: [] })
  triggeredRules: string[];

  @Column({
    name: 'model_version',
    type: 'varchar',
    length: 32,
    default: 'hybrid-v1',
  })
  modelVersion: string;

  @Column({ name: 'evaluated_at', type: 'timestamptz' })
  evaluatedAt: Date;

  @Column({ name: 'reviewed_by', type: 'varchar', length: 64, nullable: true })
  reviewedBy: string | null;

  @Column({
    name: 'review_decision',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  reviewDecision: string | null;

  @Column({
    name: 'review_reason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  reviewReason: string | null;

  @Column({ name: 'initiated_by', type: 'varchar', length: 64, nullable: true })
  initiatedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
