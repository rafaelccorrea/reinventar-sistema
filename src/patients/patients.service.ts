import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Clinic } from '../clinics/entities/clinic.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
  ) {}

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const { clinicId, responsibleId, birthDate, ...patientData } = createPatientDto;

    // 1. Verificar se a clínica existe
    const clinic = await this.clinicRepository.findOne({ where: { id: clinicId } });
    if (!clinic) {
      throw new NotFoundException('Clínica não encontrada');
    }

    const patient = this.patientRepository.create({
      ...patientData,
      birthDate: new Date(birthDate),
      clinic,
    });

    // 2. Lógica de Responsável (para menores)
    if (responsibleId) {
      const responsible = await this.patientRepository.findOne({ where: { id: responsibleId } });
      if (!responsible) {
        throw new NotFoundException('Responsável não encontrado');
      }

      const patientAge = this.calculateAge(patient.birthDate);
      const responsibleAge = this.calculateAge(responsible.birthDate);

      // Regra de Negócio: Se o paciente for menor de idade (ex: < 18), o responsável deve ser maior de idade (ex: >= 18)
      if (patientAge < 18 && responsibleAge < 18) {
        throw new BadRequestException('O paciente é menor de idade e o responsável informado também é menor de idade. O responsável deve ser maior de 18 anos.');
      }

      patient.responsible = responsible;
    } else {
      // Regra de Negócio: Se o paciente for menor de idade, deve ter um responsável
      const patientAge = this.calculateAge(patient.birthDate);
      if (patientAge < 18) {
        throw new BadRequestException('O paciente é menor de idade e deve ter um responsável cadastrado.');
      }
    }

    return this.patientRepository.save(patient);
  }

  async findAll(clinicId?: string): Promise<Patient[]> {
    const query = this.patientRepository.createQueryBuilder('patient')
      .leftJoinAndSelect('patient.clinic', 'clinic')
      .leftJoinAndSelect('patient.responsible', 'responsible')
      .where('patient.deletedAt IS NULL');

    if (clinicId) {
      query.andWhere('clinic.id = :clinicId', { clinicId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['clinic', 'responsible', 'dependents'],
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    const { clinicId, responsibleId, birthDate, ...updateData } = updatePatientDto;

    if (clinicId) {
      const clinic = await this.clinicRepository.findOne({ where: { id: clinicId } });
      if (!clinic) {
        throw new NotFoundException('Clínica não encontrada');
      }
      patient.clinic = clinic;
    }

    if (responsibleId) {
      if (responsibleId === id) {
        throw new BadRequestException('Um paciente não pode ser seu próprio responsável');
      }
      const responsible = await this.patientRepository.findOne({ where: { id: responsibleId } });
      if (!responsible) {
        throw new NotFoundException('Responsável não encontrado');
      }

      // Validação de idade do responsável na atualização
      const patientAge = this.calculateAge(birthDate ? new Date(birthDate) : patient.birthDate);
      const responsibleAge = this.calculateAge(responsible.birthDate);

      if (patientAge < 18 && responsibleAge < 18) {
        throw new BadRequestException('O paciente é menor de idade e o responsável informado também é menor de idade. O responsável deve ser maior de 18 anos.');
      }

      patient.responsible = responsible;
    } else if (birthDate) {
      // Validação de responsável ausente na atualização de data de nascimento
      const newBirthDate = new Date(birthDate);
      const patientAge = this.calculateAge(newBirthDate);
      if (patientAge < 18 && !patient.responsibleId) {
        throw new BadRequestException('O paciente é menor de idade e deve ter um responsável cadastrado.');
      }
    }


    Object.assign(patient, updateData);
    if (birthDate) {
      patient.birthDate = new Date(birthDate);
    }
    return this.patientRepository.save(patient);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.softRemove(patient);
  }
}
