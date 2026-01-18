import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Patient } from '../patients/entities/patient.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { Clinic } from '../clinics/entities/clinic.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
  ) {}

  private async validateAppointmentData(
    patientId: string,
    professionalId: string,
    clinicId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string,
  ): Promise<{ patient: Patient; professional: Professional; clinic: Clinic }> {
    // Regra de Negócio: Impedir agendamentos retroativos (apenas para criação)
    if (!excludeAppointmentId && startTime < new Date()) {
        throw new BadRequestException('Não é possível criar agendamentos retroativos.');
    }

    // 1. Verificar existência de Paciente, Profissional e Clínica
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    const professional = await this.professionalRepository.findOne({
      where: { id: professionalId },
      relations: ['clinics'],
    });
    if (!professional) {
      throw new NotFoundException('Profissional não encontrado.');
    }

    const clinic = await this.clinicRepository.findOne({ where: { id: clinicId } });
    if (!clinic) {
      throw new NotFoundException('Clínica não encontrada.');
    }

    // 2. Verificar se o profissional atua na clínica
    const isProfessionalInClinic = professional.clinics.some((c) => c.id === clinicId);
    if (!isProfessionalInClinic) {
      throw new BadRequestException('O profissional não está vinculado à clínica informada.');
    }

    // 3. Verificar conflito de horário para o Profissional
    const professionalConflict = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.professionalId = :professionalId', { professionalId })
      .andWhere('appointment.deletedAt IS NULL')
      .andWhere(
        '(:startTime < appointment.endTime AND :endTime > appointment.startTime)',
        { startTime, endTime },
      )
      .andWhere(excludeAppointmentId ? 'appointment.id != :excludeAppointmentId' : '1=1', { excludeAppointmentId })
      .getOne();

    if (professionalConflict) {
      throw new BadRequestException('Conflito de horário: O profissional já possui um agendamento neste período.');
    }

    // 4. Verificar conflito de horário para o Paciente
    const patientConflict = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.patientId = :patientId', { patientId })
      .andWhere('appointment.deletedAt IS NULL')
      .andWhere(
        '(:startTime < appointment.endTime AND :endTime > appointment.startTime)',
        { startTime, endTime },
      )
      .andWhere(excludeAppointmentId ? 'appointment.id != :excludeAppointmentId' : '1=1', { excludeAppointmentId })
      .getOne();

    if (patientConflict) {
      throw new BadRequestException('Conflito de horário: O paciente já possui um agendamento neste período.');
    }

    return { patient, professional, clinic };
  }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { patientId, professionalId, clinicId, startTime, endTime, notes, status } = createAppointmentDto;

    const start = new Date(startTime);
    const end = new Date(endTime);

    const { patient, professional, clinic } = await this.validateAppointmentData(
      patientId,
      professionalId,
      clinicId,
      start,
      end,
    );

    const appointment = this.appointmentRepository.create({
      startTime: start,
      endTime: end,
      notes,
      status,
      patient,
      professional,
      clinic,
    });

    return this.appointmentRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['patient', 'professional', 'clinic'],
      where: { deletedAt: IsNull() },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['patient', 'professional', 'clinic'],
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado.');
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    const { patientId, professionalId, clinicId, startTime, endTime, status, ...updateData } = updateAppointmentDto;

    // Regra de Negócio: Impedir alteração de status para CANCELADO ou FALTA se já estiver REALIZADO
    if (appointment.status === 'Realizado' && (status === 'Cancelado' || status === 'Falta')) {
        throw new BadRequestException('Não é possível alterar o status de um agendamento realizado para Cancelado ou Falta.');
    }

    // Regra de Negócio: Impedir alteração de data/hora para retroativo
    const newStartTime = startTime ? new Date(startTime) : appointment.startTime;
    if (newStartTime < new Date() && !updateAppointmentDto.status) {
        // Permite a alteração de status para agendamentos passados, mas não a alteração de data/hora
        throw new BadRequestException('Não é possível alterar a data/hora de um agendamento para um horário retroativo.');
    }

    const newEndTime = endTime ? new Date(endTime) : appointment.endTime;

    const newPatientId = patientId || appointment.patientId;
    const newProfessionalId = professionalId || appointment.professionalId;
    const newClinicId = clinicId || appointment.clinicId;

    const { patient, professional, clinic } = await this.validateAppointmentData(
      newPatientId,
      newProfessionalId,
      newClinicId,
      newStartTime,
      newEndTime,
      id, // Excluir o próprio agendamento da verificação de conflito
    );

    Object.assign(appointment, updateData);
    if (status) appointment.status = status;
    appointment.patient = patient;
    appointment.professional = professional;
    appointment.clinic = clinic;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;

    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.softRemove(appointment);
  }
}

    const newPatientId = patientId || appointment.patientId;
    const newProfessionalId = professionalId || appointment.professionalId;
    const newClinicId = clinicId || appointment.clinicId;
    const newStartTime = startTime ? new Date(startTime) : appointment.startTime;
    const newEndTime = endTime ? new Date(endTime) : appointment.endTime;

    const { patient, professional, clinic } = await this.validateAppointmentData(
      newPatientId,
      newProfessionalId,
      newClinicId,
      newStartTime,
      newEndTime,
      id, // Excluir o próprio agendamento da verificação de conflito
    );

    Object.assign(appointment, updateData);
    if (status) appointment.status = status;
    appointment.patient = patient;
    appointment.professional = professional;
    appointment.clinic = clinic;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;

    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.softRemove(appointment);
  }
}
