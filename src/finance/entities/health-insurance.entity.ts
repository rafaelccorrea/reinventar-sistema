import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('health_insurances')
export class HealthInsurance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  cnpj: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  sessionPrice: number; // Valor padrão de sessão para este convênio

  @Column({ default: true })
  isActive: boolean;

  // Campos de Auditoria e Soft Delete
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;
}
