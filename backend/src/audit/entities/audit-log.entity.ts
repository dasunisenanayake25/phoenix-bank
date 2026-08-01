import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_type', type: 'varchar', length: 32 })
  actorType: string;

  @Column({ name: 'actor_id', type: 'varchar', length: 64 })
  actorId: string;

  @Column({ type: 'varchar', length: 64 })
  action: string;

  @Column({ name: 'target_type', type: 'varchar', length: 64, nullable: true })
  targetType: string | null;

  @Column({ name: 'target_id', type: 'varchar', length: 64, nullable: true })
  targetId: string | null;

  @Column({ type: 'varchar', length: 32 })
  result: string;

  @Column({ name: 'source_ip', type: 'varchar', length: 64, nullable: true })
  sourceIp: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  @Column({ name: 'device_id', type: 'varchar', length: 64, nullable: true })
  deviceId: string | null;

  @Column({
    name: 'correlation_id',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  correlationId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'previous_hash',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  previousHash: string | null;

  @Column({ name: 'event_hash', type: 'varchar', length: 128 })
  eventHash: string;
}
