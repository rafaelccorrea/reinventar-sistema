import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entities/professional.entity';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { Clinic } from '../clinics/entities/clinic.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async findClinicsByIds(clinicIds: string[]): Promise<Clinic[]> {
    const clinics = await this.clinicRepository.findByIds(clinicIds);
    if (clinics.length !== clinicIds.length) {
      throw new NotFoundException('Uma ou mais clínicas não foram encontradas.');
    }
    return clinics;
  }

  async create(createProfessionalDto: CreateProfessionalDto): Promise<Professional> {
    const { userId, clinicIds, ...professionalData } = createProfessionalDto;

    // 1. Verificar se o usuário existe e se possui a Role correta (ex: 'PROFISSIONAL')
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    
    // Regra de Negócio: O usuário deve ter a role 'PROFISSIONAL' ou 'ADMIN' para ser cadastrado como profissional
    const isProfessionalOrAdmin = user.roles.some(role => role.name === 'PROFISSIONAL' || role.name === 'ADMIN');
    if (!isProfessionalOrAdmin) {
        throw new BadRequestException('O usuário não possui a permissão necessária (Role: PROFISSIONAL) para ser cadastrado como profissional.');
    }

    // 2. Verificar se o usuário já é um profissional
    const existingProfessional = await this.professionalRepository.findOne({ where: { userId } });
    if (existingProfessional) {
      throw new BadRequestException('Este usuário já está cadastrado como profissional.');
    }

    // 3. Encontrar as clínicas
    const clinics = await this.findClinicsByIds(clinicIds);

    // 4. Verificar unicidade do registro (registrationNumber + council)
    const existingRegistration = await this.professionalRepository.findOne({
        where: {
            registrationNumber: professionalData.registrationNumber,
            council: professionalData.council,
        }
    });

    if (existingRegistration) {
        throw new BadRequestException(`O registro ${professionalData.registrationNumber} no conselho ${professionalData.council} já está cadastrado.`);
    }

    // 5. Criar o profissional
    const professional = this.professionalRepository.create({
      ...professionalData,
      user,
      clinics,
    });

    return this.professionalRepository.save(professional);
  }

  async findAll(): Promise<Professional[]> {
    return this.professionalRepository.find({
      relations: ['user', 'clinics'],
      where: { deletedAt: null },
    });
  }

  async findOne(id: string): Promise<Professional> {
    const professional = await this.professionalRepository.findOne({
      where: { id },
      relations: ['user', 'clinics'],
    });

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado.');
    }

    return professional;
  }

  async update(id: string, updateProfessionalDto: UpdateProfessionalDto): Promise<Professional> {
    const professional = await this.findOne(id);
    const { clinicIds, userId, registrationNumber, council, ...updateData } = updateProfessionalDto;

    // 1. Verificar unicidade do registro (registrationNumber + council) na atualização
    if (registrationNumber || council) {
        const newRegistrationNumber = registrationNumber || professional.registrationNumber;
        const newCouncil = council || professional.council;

        const existingRegistration = await this.professionalRepository.findOne({
            where: {
                registrationNumber: newRegistrationNumber,
                council: newCouncil,
                id: Not(id), // Excluir o próprio registro
            }
        });

        if (existingRegistration) {
            throw new BadRequestException(`O registro ${newRegistrationNumber} no conselho ${newCouncil} já está cadastrado em outro profissional.`);
        }
        
        if (registrationNumber) professional.registrationNumber = registrationNumber;
        if (council) professional.council = council;
    }

    const { userId: updateUserId, ...restUpdateData } = updateData;

    // Não permitir a alteração do userId
    if (userId && userId !== professional.userId) {
      throw new BadRequestException('Não é permitido alterar o usuário associado ao profissional.');
    }

    // Atualizar dados básicos
    Object.assign(professional, restUpdateData);

    // Atualizar clínicas
    if (clinicIds) {
      const clinics = await this.findClinicsByIds(clinicIds);
      professional.clinics = clinics;
    }

    return this.professionalRepository.save(professional);
  }

  async remove(id: string): Promise<void> {
    const professional = await this.findOne(id);
    await this.professionalRepository.softRemove(professional);
  }
}
