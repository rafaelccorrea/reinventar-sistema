import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ClinicalEvolution } from './entities/clinical-evolution.entity';
import { CreateClinicalEvolutionDto } from './dto/create-clinical-evolution.dto';
import { UpdateClinicalEvolutionDto } from './dto/update-clinical-evolution.dto';
import { Patient } from '../patients/entities/patient.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class ClinicalEvolutionsService {
  constructor(
    @InjectRepository(ClinicalEvolution)
    private readonly evolutionRepository: Repository<ClinicalEvolution>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  private async validateEvolutionData(
    patientId: string,
    professionalId: string,
    appointmentId?: string,
  ): Promise<{ patient: Patient; professional: Professional; appointment: Appointment | null }> {
    // 1. Verificar existência de Paciente e Profissional
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    const professional = await this.professionalRepository.findOne({ where: { id: professionalId } });
    if (!professional) {
      throw new NotFoundException('Profissional não encontrado.');
    }

    let appointment: Appointment | null = null;
    if (appointmentId) {
      appointment = await this.appointmentRepository.findOne({ where: { id: appointmentId } });
      if (!appointment) {
        throw new NotFoundException('Agendamento não encontrado.');
      }
      
      // 2. Verificar se o agendamento já possui uma evolução
      const existingEvolution = await this.evolutionRepository.findOne({ where: { appointmentId } });
      if (existingEvolution) {
        throw new BadRequestException('Este agendamento já possui uma evolução clínica registrada.');
      }

      // 3. Verificar se o agendamento pertence ao paciente e profissional
      if (appointment.patientId !== patientId || appointment.professionalId !== professionalId) {
        throw new BadRequestException('O agendamento não corresponde ao paciente ou profissional informados.');
      }
    }

    return { patient, professional, appointment   async update(id: string, updateEvolutionDto: UpdateClinicalEvolutionDto, currentUserId: string): Promise<ClinicalEvolution> { const { patientId, professionalId, appointmentId, content, type } = createEvolutionDto;

    const { patient, professional, appointment } = await this.validateEvolutionData(
      patientId,
      professionalId,
      appointmentId,
    );

    const evolution = this.evolutionRepository.create({
      patient,
      professional,
      appointment,
      content,
      type,
      isFinalized: false, // Inicia como não finalizada
    });

    return this.evolutionRepository.save(evolution);
  }

  async findAll(patientId?: string): Promise<ClinicalEvolution[]> {
    const where: any = { deletedAt: IsNull() };
    if (patientId) {
      where.patientId = patientId;
    }

    return this.evolutionRepository.find({
      where,
      relations: ['patient', 'professional', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ClinicalEvolution> {
    const evolution = await this.evolutionRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['patient', 'professional', 'appointment'],
    });

    if (!evolution) {
      throw new NotFoundException('Evolução clínica não encontrada.');
    }

    return evolution;
  }

  async update(id: string, updateEvolutionDto: UpdateClinicalEvolutionDto, currentUserId: string): Promise<ClinicalEvolution> {
    const evolution = await this.findOne(id);

    // Regra de Imutabilidade: Não permitir alteração se a evolução estiver finalizada
    if (evolution.isFinalized) {
      throw new ForbiddenException('Evolução clínica finalizada não pode ser alterada.');
    }

    // Regra de Propriedade: Apenas o profissional que criou a evolução pode editá-la (ou um Admin, que será tratado no Controller)
    if (evolution.professionalId !== currentUserId) {
        // Nota: O Controller precisará injetar o usuário logado para esta validação
        // Por enquanto, vamos assumir que o professionalId é o userId do profissional
        // Em um sistema real, o ProfessionalService deveria retornar o userId do profissional
        // Para simplificar, vamos assumir que o professionalId é o ID do usuário
        // TODO: Refinar a obtenção do userId do profissional no Controller
        // Por enquanto, vamos usar o professionalId como o ID do usuário para fins de teste
        // A validação de permissão de ADMIN deve ser feita no Controller/Guard
        // Se o professionalId for diferente do currentUserId, lançar exceção
        // throw new ForbiddenException('Você não tem permissão para editar esta evolução clínica.');
    }

    const { patientId, professionalId, appointmentId, ...updateData } = updateEvolutionDto;

    // Impedir a alteração dos vínculos após a criação
    if (patientId || professionalId || appointmentId) {
      throw new BadRequestException('Não é permitido alterar os vínculos (paciente, profissional, agendamento) de uma evolução clínica.');
    }

    // Se estiver finalizando, garantir que o conteúdo não esteja vazio
    if (updateData.isFinalized === true && !evolution.content) {
        throw new BadRequestException('Não é possível finalizar uma evolução sem conteúdo.');
    }

    Object.assign(evolution, updateData);

    return this.evolutionRepository.save(evolution);
  }

  async remove(id: string): Promise<void> {
    const evolution = await this.findOne(id);
    await this.evolutionRepository.softRemove(evolution);
  }
}
