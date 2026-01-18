import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Professional } from '../../professionals/entities/professional.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

export enum EvolutionType {
  PRIMEIRA_AVALIACAO = 'Primeira Avaliação',
  EVOLUCAO_CLINICA = 'Evolução Clínica',
  REAVALIACAO = 'Reavaliação',
  ALTA = 'Alta',
}

@Entity('clinical_evolutions')
export class ClinicalEvolution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EvolutionType, default: EvolutionType.EVOLUCAO_CLINICA })
  type: EvolutionType;

  @Column({ type: 'text' })
  content: string; // O texto da evolução clínica

  @Column({ type: 'boolean', default: false, name: 'is_finalized' })
  isFinalized: boolean; // Indica se a evolução está finalizada e não deve ser alterada

  // Relação com Paciente (Prontuário)
  @ManyToOne(() => Patient, { nullable: false })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  // Relação com Profissional (Quem realizou a evolução)
  @ManyToOne(() => Professional, { nullable: false })
  @JoinColumn({ name: 'professional_id' })
  professional: Professional;

  @Column({ name: 'professional_id' })
  professionalId: string;

  // Relação com Agendamento (Opcional, mas recomendado)
  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ name: 'appointment_id', nullable: true, unique: true })
  appointmentId: string; // Garante que um agendamento só tenha uma evolução

  // Campos de Auditoria e Soft Delete
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;
}
