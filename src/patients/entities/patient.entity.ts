import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';

export enum Gender {
  MASCULINO = 'Masculino',
  FEMININO = 'Feminino',
  OUTRO = 'Outro',
  NAO_INFORMADO = 'Não Informado',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'enum', enum: Gender, default: Gender.NAO_INFORMADO })
  gender: Gender;

  @Column({ nullable: true })
  cpf: string;

  // Relação com a Clínica
  @ManyToOne(() => Clinic, { nullable: false })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ name: 'clinic_id' })
  clinicId: string;

  // Auto-relacionamento para Responsável (para menores)
  @ManyToOne(() => Patient, (patient) => patient.dependents, { nullable: true })
  @JoinColumn({ name: 'responsible_id' })
  responsible: Patient;

  @Column({ name: 'responsible_id', nullable: true })
  responsibleId: string;

  @OneToMany(() => Patient, (patient) => patient.responsible)
  dependents: Patient[];

  // Campos de Auditoria e Soft Delete
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;
}
