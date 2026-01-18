import { IsNotEmpty, IsUUID, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EvolutionType } from '../entities/clinical-evolution.entity';

export class CreateClinicalEvolutionDto {
  @ApiProperty({ description: 'ID do paciente ao qual a evolução se refere' })
  @IsNotEmpty({ message: 'O ID do paciente é obrigatório.' })
  @IsUUID('4', { message: 'O ID do paciente deve ser um UUID válido.' })
  patientId: string;

  @ApiProperty({ description: 'ID do profissional que está registrando a evolução' })
  @IsNotEmpty({ message: 'O ID do profissional é obrigatório.' })
  @IsUUID('4', { message: 'O ID do profissional deve ser um UUID válido.' })
  professionalId: string;

  @ApiProperty({ description: 'ID do agendamento relacionado (opcional)', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'O ID do agendamento deve ser um UUID válido.' })
  appointmentId?: string;

  @ApiProperty({ description: 'Tipo de evolução', enum: EvolutionType, default: EvolutionType.EVOLUCAO_CLINICA })
  @IsNotEmpty({ message: 'O tipo de evolução é obrigatório.' })
  @IsEnum(EvolutionType, { message: `O tipo deve ser um dos seguintes valores: ${Object.values(EvolutionType).join(', ')}` })
  type: EvolutionType;

  @ApiProperty({ description: 'Conteúdo da evolução clínica' })
  @IsNotEmpty({ message: 'O conteúdo da evolução é obrigatório.' })
  @IsString({ message: 'O conteúdo deve ser uma string.' })
  @MaxLength(5000, { message: 'O conteúdo da evolução não pode exceder 5000 caracteres.' })
  content: string;
}
