import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Clinic } from './entities/clinic.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Lógica de criação de usuário (incluindo hash de senha)
    // ...
    const user = this.userRepository.create(createUserDto as any);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ where: { deletedAt: IsNull() }, relations: ['role', 'clinics'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id, deletedAt: IsNull() }, relations: ['role', 'clinics'] });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email, deletedAt: IsNull() }, relations: ['role', 'clinics', 'role.permissions'] });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
  }

  // Métodos para Roles e Clinics (CRUD simplificado)
  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({ where: { deletedAt: IsNull() }, relations: ['permissions'] });
  }

  async findAllClinics(): Promise<Clinic[]> {
    return this.clinicRepository.find({ where: { deletedAt: IsNull() } });
  }
}
