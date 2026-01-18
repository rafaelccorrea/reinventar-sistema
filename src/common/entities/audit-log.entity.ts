import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // Ex: USER_CREATED, PATIENT_UPDATED

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  targetId: string; // ID da entidade afetada

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
