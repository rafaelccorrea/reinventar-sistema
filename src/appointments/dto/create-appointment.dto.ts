import { IsNotEmpty, IsUUID, IsISO8601, IsString, IsOptional, IsEnum, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../entities/appointment.entity';

// Validação customizada para garantir que endTime seja depois de startTime
@ValidatorConstraint({ async: false })
export class IsEndTimeAfterStartTimeConstraint implements ValidatorConstraintInterface {
  validate(endTime: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const startTime = (args.object as any)[relatedPropertyName];
    
    if (!startTime || !endTime) {
      return true; // Deixa o IsNotEmpty lidar com a ausência
    }

    return new Date(endTime) > new Date(startTime);
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `A data/hora de término (${args.property}) deve ser posterior à data/hora de início (${relatedPropertyName}).`;
  }
}

export function IsEndTimeAfterStartTime(property: string, validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsEndTimeAfterStartTimeConstraint,
    });
  };
}

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID do paciente agendado' })
  @IsNotEmpty({ message: 'O ID do paciente é obrigatório.' })
  @IsUUID('4', { message: 'O ID do paciente deve ser um UUID válido.' })
  patientId: string;

  @ApiProperty({ description: 'ID do profissional que realizará o atendimento' })
  @IsNotEmpty({ message: 'O ID do profissional é obrigatório.' })
  @IsUUID('4', { message: 'O ID do profissional deve ser um UUID válido.' })
  professionalId: string;

  @ApiProperty({ description: 'ID da clínica onde ocorrerá o agendamento' })
  @IsNotEmpty({ message: 'O ID da clínica é obrigatório.' })
  @IsUUID('4', { message: 'O ID da clínica deve ser um UUID válido.' })
  clinicId: string;

  @ApiProperty({ description: 'Data e hora de início do agendamento (ISO 8601)' })
  @IsNotEmpty({ message: 'A data/hora de início é obrigatória.' })
  @IsISO8601({ strict: true }, { message: 'A data/hora de início deve estar no formato ISO8601.' })
  startTime: string;

  @ApiProperty({ description: 'Data e hora de término do agendamento (ISO 8601)' })
  @IsNotEmpty({ message: 'A data/hora de término é obrigatória.' })
  @IsISO8601({ strict: true }, { message: 'A data/hora de término deve estar no formato ISO8601.' })
  @IsEndTimeAfterStartTime('startTime', { message: 'A hora de término deve ser posterior à hora de início.' })
  endTime: string;

  @ApiProperty({ description: 'Observações sobre o agendamento', required: false })
  @IsOptional()
  @IsString({ message: 'As notas devem ser uma string.' })
  notes?: string;

  @ApiProperty({ description: 'Status inicial do agendamento', enum: AppointmentStatus, default: AppointmentStatus.AGENDADO, required: false })
  @IsOptional()
  @IsEnum(AppointmentStatus, { message: `O status deve ser um dos seguintes valores: ${Object.values(AppointmentStatus).join(', ')}` })
  status?: AppointmentStatus;
}
