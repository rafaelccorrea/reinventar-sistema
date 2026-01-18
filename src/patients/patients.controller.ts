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
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { SanitizeStringPipe } from '../common/pipes/sanitize-string.pipe';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@UsePipes(SanitizeStringPipe) // Aplica a sanitização em todos os endpoints
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Permissions('patients:create')
  @AuditLog('CREATE_PATIENT')
  @ApiOperation({ summary: 'Criar um novo paciente' })
  @ApiResponse({ status: 201, description: 'Paciente criado com sucesso.' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @Permissions('patients:read')
  @ApiOperation({ summary: 'Listar todos os pacientes' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes retornada com sucesso.' })
  findAll(@Query('clinicId') clinicId?: string) {
    return this.patientsService.findAll(clinicId);
  }

  @Get(':id')
  @Permissions('patients:read')
  @ApiOperation({ summary: 'Obter detalhes de um paciente' })
  @ApiResponse({ status: 200, description: 'Detalhes do paciente retornados com sucesso.' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('patients:update')
  @AuditLog('UPDATE_PATIENT')
  @ApiOperation({ summary: 'Atualizar dados de um paciente' })
  @ApiResponse({ status: 200, description: 'Paciente atualizado com sucesso.' })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @Permissions('patients:delete')
  @AuditLog('DELETE_PATIENT')
  @ApiOperation({ summary: 'Remover um paciente (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Paciente removido com sucesso.' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
