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
import { Clinic } from '../../clinics/entities/clinic.entity';

export enum AppointmentStatus {
  AGENDADO = 'Agendado',
  CONFIRMADO = 'Confirmado',
  REALIZADO = 'Realizado',
  CANCELADO = 'Cancelado',
  FALTA = 'Falta',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp with time zone', name: 'start_time' })
  startTime: Date;

  @Column({ type: 'timestamp with time zone', name: 'end_time' })
  endTime: Date;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.AGENDADO })
  status: AppointmentStatus;

  @Column({ nullable: true })
  notes: string;

  // Relação com Paciente
  @ManyToOne(() => Patient, { nullable: false })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  // Relação com Profissional
  @ManyToOne(() => Professional, { nullable: false })
  @JoinColumn({ name: 'professional_id' })
  professional: Professional;

  @Column({ name: 'professional_id' })
  professionalId: string;

  // Relação com Clínica (Onde o agendamento ocorrerá)
  @ManyToOne(() => Clinic, { nullable: false })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ name: 'clinic_id' })
  clinicId: string;

  // Campos de Auditoria e Soft Delete
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;
}
