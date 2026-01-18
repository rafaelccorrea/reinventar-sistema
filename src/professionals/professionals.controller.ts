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
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@ApiTags('Professionals')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Post()
  @Permissions('professionals:create')
  @AuditLog('CREATE_PROFESSIONAL')
  @ApiOperation({ summary: 'Criar um novo profissional e vincular a um usuário' })
  @ApiResponse({ status: 201, description: 'Profissional criado com sucesso.' })
  create(@Body() createProfessionalDto: CreateProfessionalDto) {
    return this.professionalsService.create(createProfessionalDto);
  }

  @Get()
  @Permissions('professionals:read')
  @ApiOperation({ summary: 'Listar todos os profissionais' })
  @ApiResponse({ status: 200, description: 'Lista de profissionais retornada com sucesso.' })
  findAll() {
    return this.professionalsService.findAll();
  }

  @Get(':id')
  @Permissions('professionals:read')
  @ApiOperation({ summary: 'Obter detalhes de um profissional' })
  @ApiResponse({ status: 200, description: 'Detalhes do profissional retornados com sucesso.' })
  @ApiResponse({ status: 404, description: 'Profissional não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.professionalsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('professionals:update')
  @AuditLog('UPDATE_PROFESSIONAL')
  @ApiOperation({ summary: 'Atualizar dados de um profissional' })
  @ApiResponse({ status: 200, description: 'Profissional atualizado com sucesso.' })
  update(@Param('id') id: string, @Body() updateProfessionalDto: UpdateProfessionalDto) {
    return this.professionalsService.update(id, updateProfessionalDto);
  }

  @Delete(':id')
  @Permissions('professionals:delete')
  @AuditLog('DELETE_PROFESSIONAL')
  @ApiOperation({ summary: 'Remover um profissional (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Profissional removido com sucesso.' })
  remove(@Param('id') id: string) {
    return this.professionalsService.remove(id);
  }
}
