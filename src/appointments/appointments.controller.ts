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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Permissions('appointments:create')
  @AuditLog('CREATE_APPOINTMENT')
  @ApiOperation({ summary: 'Criar um novo agendamento' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso.' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @Permissions('appointments:read')
  @ApiOperation({ summary: 'Listar todos os agendamentos' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos retornada com sucesso.' })
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  @Permissions('appointments:read')
  @ApiOperation({ summary: 'Obter detalhes de um agendamento' })
  @ApiResponse({ status: 200, description: 'Detalhes do agendamento retornados com sucesso.' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('appointments:update')
  @AuditLog('UPDATE_APPOINTMENT')
  @ApiOperation({ summary: 'Atualizar dados de um agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento atualizado com sucesso.' })
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @Permissions('appointments:delete')
  @AuditLog('DELETE_APPOINTMENT')
  @ApiOperation({ summary: 'Remover um agendamento (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Agendamento removido com sucesso.' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
