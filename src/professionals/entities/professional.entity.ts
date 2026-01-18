import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Clinic } from '../../clinics/entities/clinic.entity';

export enum ProfessionalCouncil {
  CREFONO = 'CREFONO',
  CRM = 'CRM',
  CRP = 'CRP',
  COREN = 'COREN',
  OUTRO = 'OUTRO',
}

@Entity('professionals')
export class Professional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'registration_number' })
  registrationNumber: string;

  @Column({ type: 'enum', enum: ProfessionalCouncil, default: ProfessionalCouncil.CREFONO })
  council: ProfessionalCouncil;

  @Column({ nullable: true })
  specialty: string;

  // Relação 1:1 com User (O profissional é um usuário do sistema)
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  // Relação N:M com Clinic (Um profissional pode atuar em várias clínicas)
  @ManyToMany(() => Clinic, (clinic) => clinic.professionals)
  @JoinTable({
    name: 'professional_clinics',
    joinColumn: {
      name: 'professional_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'clinic_id',
      referencedColumnName: 'id',
    },
  })
  clinics: Clinic[];

  // Campos de Auditoria e Soft Delete
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;
}
