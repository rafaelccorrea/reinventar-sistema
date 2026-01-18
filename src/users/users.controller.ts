import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@ApiTags('Users (Usuários, Roles e Clínicas)')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions('users:create')
  @AuditLog('CREATE_USER')
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Permissions('users:read')
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Obter detalhes de um usuário' })
  @ApiResponse({ status: 200, description: 'Detalhes do usuário retornados com sucesso.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions('users:update')
  @AuditLog('UPDATE_USER')
  @ApiOperation({ summary: 'Atualizar dados de um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions('users:delete')
  @AuditLog('DELETE_USER')
  @ApiOperation({ summary: 'Remover um usuário (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('roles')
  @Permissions('roles:read')
  @ApiOperation({ summary: 'Listar todas as Roles (Perfis de Acesso)' })
  @ApiResponse({ status: 200, description: 'Lista de Roles retornada com sucesso.' })
  findAllRoles() {
    return this.usersService.findAllRoles();
  }

  @Get('clinics')
  @Permissions('clinics:read')
  @ApiOperation({ summary: 'Listar todas as Clínicas (Unidades)' })
  @ApiResponse({ status: 200, description: 'Lista de Clínicas retornada com sucesso.' })
  findAllClinics() {
    return this.usersService.findAllClinics();
  }
}
