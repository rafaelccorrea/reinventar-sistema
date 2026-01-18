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
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { HealthInsurance } from './health-insurance.entity';

export enum TransactionType {
  RECEITA = 'Receita',
  DESPESA = 'Despesa',
}

export enum PaymentMethod {
  PARTICULAR = 'Particular',
  CONVENIO = 'Convênio',
  DINHEIRO = 'Dinheiro',
  CARTAO_CREDITO = 'Cartão de Crédito',
  CARTAO_DEBITO = 'Cartão de Débito',
  PIX = 'PIX',
  TRANSFERENCIA = 'Transferência',
}

@Entity('financial_transactions')
export class FinancialTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: Date;

  // Relação com Agendamento (Opcional, para faturamento de sessões)
  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ name: 'appointment_id', nullable: true, unique: true })
  appointmentId: string;

  // Relação com Paciente (Opcional, para pagamentos particulares)
  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id', nullable: true })
  patientId: string;

  // Relação com Convênio (Opcional, para faturamento de convênios)
  @ManyToOne(() => HealthInsurance, { nullable: true })
  @JoinColumn({ name: 'health_insurance_id' })
  healthInsurance: HealthInsurance;

  @Column({ name: 'health_insurance_id', nullable: true })
  healthInsuranceId: string;

  // Campos de Auditoria e Soft Delete
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;
}
