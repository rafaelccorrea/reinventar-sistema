import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { HealthInsurance } from './entities/health-insurance.entity';
import { FinancialTransaction, TransactionType, PaymentMethod } from './entities/financial-transaction.entity';
import { CreateHealthInsuranceDto } from './dto/create-health-insurance.dto';
import { UpdateHealthInsuranceDto } from './dto/update-health-insurance.dto';
import { CreateFinancialTransactionDto } from './dto/create-financial-transaction.dto';
import { UpdateFinancialTransactionDto } from './dto/update-financial-transaction.dto';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(HealthInsurance)
    private readonly insuranceRepository: Repository<HealthInsurance>,
    @InjectRepository(FinancialTransaction)
    private readonly transactionRepository: Repository<FinancialTransaction>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  // --- Health Insurance (Convênios) ---

  async createInsurance(dto: CreateHealthInsuranceDto): Promise<HealthInsurance> {
    const existing = await this.insuranceRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`Convênio com o nome "${dto.name}" já existe.`);
    }
    const insurance = this.insuranceRepository.create(dto);
    return this.insuranceRepository.save(insurance);
  }

  async findAllInsurances(): Promise<HealthInsurance[]> {
    return this.insuranceRepository.find({ where: { deletedAt: IsNull() } });
  }

  async findOneInsurance(id: string): Promise<HealthInsurance> {
    const insurance = await this.insuranceRepository.findOne({ where: { id, deletedAt: IsNull() } });
    if (!insurance) {
      throw new NotFoundException('Convênio não encontrado.');
    }
    return insurance;
  }

  async updateInsurance(id: string, dto: UpdateHealthInsuranceDto): Promise<HealthInsurance> {
    const insurance = await this.findOneInsurance(id);
    Object.assign(insurance, dto);
    return this.insuranceRepository.save(insurance);
  }

  async removeInsurance(id: string): Promise<void> {
    const insurance = await this.findOneInsurance(id);
    await this.insuranceRepository.softRemove(insurance);
  }

  // --- Financial Transactions (Transações) ---

  async createTransaction(dto: CreateFinancialTransactionDto): Promise<FinancialTransaction> {
    const { appointmentId, patientId, healthInsuranceId, transactionDate, ...rest } = dto;

    // Validação de Integridade
    if (appointmentId) {
      const existingTransaction = await this.transactionRepository.findOne({ where: { appointmentId } });
      if (existingTransaction) {
        throw new BadRequestException('Já existe uma transação registrada para este agendamento.');
      }
    }

    const transaction = this.transactionRepository.create({
      ...rest,
      transactionDate: new Date(transactionDate),
      appointmentId,
      patientId,
      healthInsuranceId,
    });

    return this.transactionRepository.save(transaction);
  }

  async findAllTransactions(): Promise<FinancialTransaction[]> {
    return this.transactionRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['appointment', 'patient', 'healthInsurance'],
      order: { transactionDate: 'DESC' },
    });
  }

  async findOneTransaction(id: string): Promise<FinancialTransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['appointment', 'patient', 'healthInsurance'],
    });
    if (!transaction) {
      throw new NotFoundException('Transação não encontrada.');
    }
    return transaction;
  }

  async updateTransaction(id: string, dto: UpdateFinancialTransactionDto): Promise<FinancialTransaction> {
    const transaction = await this.findOneTransaction(id);
    const { transactionDate, ...rest } = dto;

    // Regra de Imutabilidade: Não permitir alteração de vínculos após a criação
    if (dto.appointmentId && dto.appointmentId !== transaction.appointmentId) {
      throw new BadRequestException('Não é permitido alterar o agendamento vinculado a uma transação.');
    }

    Object.assign(transaction, rest);
    if (transactionDate) {
      transaction.transactionDate = new Date(transactionDate);
    }

    return this.transactionRepository.save(transaction);
  }

  async removeTransaction(id: string): Promise<void> {
    const transaction = await this.findOneTransaction(id);
    await this.transactionRepository.softRemove(transaction);
  }

  // --- Lógica de Faturamento Automático ---

  async generateInvoiceForCompletedAppointment(appointmentId: string): Promise<FinancialTransaction> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, deletedAt: IsNull() },
      relations: ['patient'],
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado.');
    }

    if (appointment.status !== AppointmentStatus.REALIZADO) {
      throw new BadRequestException('O faturamento só pode ser gerado para agendamentos com status "Realizado".');
    }

    // Verificar se já existe transação
    const existingTransaction = await this.transactionRepository.findOne({ where: { appointmentId } });
    if (existingTransaction) {
      return existingTransaction; // Já faturado
    }

    // Lógica de Faturamento
    let amount: number;
    let description: string;
    let healthInsuranceId: string | null = null;
    let paymentMethod: PaymentMethod = PaymentMethod.PARTICULAR;

    // TODO: Implementar a lógica de vínculo do paciente com convênio
    // Por enquanto, vamos simular que se o paciente tiver um convênio, ele usa.
    // Se não, é particular com um valor fixo.

    // Simulação de Convênio/Particular
    const patient = await this.patientRepository.findOne({ where: { id: appointment.patientId } });
    
    // Se o paciente tiver um convênio vinculado (simulação)
    if (patient && patient.healthInsuranceId) {
        const insurance = await this.insuranceRepository.findOne({ where: { id: patient.healthInsuranceId } });
        if (insurance) {
            amount = insurance.sessionPrice;
            description = `Faturamento Convênio ${insurance.name} - Sessão ${appointmentId}`;
            healthInsuranceId = insurance.id;
            paymentMethod = PaymentMethod.CONVENIO;
        }
    }

    // Se for particular ou o convênio não for encontrado/válido
    if (!amount) {
        // Valor fixo para sessão particular (exemplo)
        amount = 150.00; 
        description = `Pagamento Particular - Sessão ${appointmentId}`;
        paymentMethod = PaymentMethod.PARTICULAR;
    }

    const transactionDto: CreateFinancialTransactionDto = {
      type: TransactionType.RECEITA,
      amount,
      description,
      paymentMethod,
      transactionDate: new Date().toISOString().split('T')[0],
      appointmentId,
      patientId: appointment.patientId,
      healthInsuranceId,
    };

    return this.createTransaction(transactionDto);
  }
}
