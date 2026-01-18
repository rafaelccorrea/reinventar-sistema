import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsOptional, IsEnum, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../entities/appointment.entity';
import { IsEndTimeAfterStartTime } from './create-appointment.dto';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({ description: 'Data e hora de início do agendamento (ISO 8601)', required: false })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'A data/hora de início deve estar no formato ISO8601.' })
  startTime?: string;

  @ApiProperty({ description: 'Data e hora de término do agendamento (ISO 8601)', required: false })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'A data/hora de término deve estar no formato ISO8601.' })
  @IsEndTimeAfterStartTime('startTime', { message: 'A hora de término deve ser posterior à hora de início.' })
  endTime?: string;

  @ApiProperty({ description: 'Status do agendamento', enum: AppointmentStatus, required: false })
  @IsOptional()
  @IsEnum(AppointmentStatus, { message: `O status deve ser um dos seguintes valores: ${Object.values(AppointmentStatus).join(', ')}` })
  status?: AppointmentStatus;
}
