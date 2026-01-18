import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicalEvolutionsService } from './clinical-evolutions.service';
import { CreateClinicalEvolutionDto } from './dto/create-clinical-evolution.dto';
import { UpdateClinicalEvolutionDto } from './dto/update-clinical-evolution.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@ApiTags('Clinical Evolutions (Prontuário)')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller('clinical-evolutions')
export class ClinicalEvolutionsController {
  constructor(private readonly clinicalEvolutionsService: ClinicalEvolutionsService) {}

  @Post()
  @Permissions('evolutions:create')
  @AuditLog('CREATE_EVOLUTION')
  @ApiOperation({ summary: 'Registrar uma nova evolução clínica' })
  @ApiResponse({ status: 201, description: 'Evolução registrada com sucesso.' })
  create(@Body() createEvolutionDto: CreateClinicalEvolutionDto) {
    return this.clinicalEvolutionsService.create(createEvolutionDto);
  }

  @Get()
  @Permissions('evolutions:read')
  @ApiOperation({ summary: 'Listar evoluções clínicas (opcionalmente por paciente)' })
  @ApiResponse({ status: 200, description: 'Lista de evoluções retornada com sucesso.' })
  findAll(@Query('patientId') patientId?: string) {
    return this.clinicalEvolutionsService.findAll(patientId);
  }

  @Get(':id')
  @Permissions('evolutions:read')
  @ApiOperation({ summary: 'Obter detalhes de uma evolução clínica' })
  @ApiResponse({ status: 200, description: 'Detalhes da evolução retornados com sucesso.' })
  @ApiResponse({ status: 404, description: 'Evolução não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.clinicalEvolutionsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('evolutions:update')
  @AuditLog('UPDATE_EVOLUTION')
  @ApiOperation({ summary: 'Atualizar dados de uma evolução clínica (somente se não finalizada)' })
  @ApiResponse({ status: 200, description: 'Evolução atualizada com sucesso.' })
  update(@Param('id') id: string, @Body() updateEvolutionDto: UpdateClinicalEvolutionDto) {
    return this.clinicalEvolutionsService.update(id, updateEvolutionDto);
  }

  @Delete(':id')
  @Permissions('evolutions:delete')
  @AuditLog('DELETE_EVOLUTION')
  @ApiOperation({ summary: 'Remover uma evolução clínica (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Evolução removida com sucesso.' })
  remove(@Param('id') id: string) {
    return this.clinicalEvolutionsService.remove(id);
  }
}
