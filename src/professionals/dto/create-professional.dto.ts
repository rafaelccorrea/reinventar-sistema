import { IsNotEmpty, IsString, IsUUID, IsEnum, IsOptional, ArrayMinSize, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProfessionalCouncil } from '../entities/professional.entity';

export class CreateProfessionalDto {
  @ApiProperty({ description: 'ID do usuário associado a este profissional' })
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório.' })
  @IsUUID('4', { message: 'O ID do usuário deve ser um UUID válido.' })
  userId: string;

  @ApiProperty({ description: 'Número de registro no conselho profissional' })
  @IsNotEmpty({ message: 'O número de registro é obrigatório.' })
  @IsString({ message: 'O número de registro deve ser uma string.' })
  registrationNumber: string;

  @ApiProperty({ description: 'Conselho profissional', enum: ProfessionalCouncil })
  @IsNotEmpty({ message: 'O conselho profissional é obrigatório.' })
  @IsEnum(ProfessionalCouncil, { message: `O conselho deve ser um dos seguintes valores: ${Object.values(ProfessionalCouncil).join(', ')}` })
  council: ProfessionalCouncil;

  @ApiProperty({ description: 'Especialidade do profissional', required: false })
  @IsOptional()
  @IsString({ message: 'A especialidade deve ser uma string.' })
  specialty?: string;

  @ApiProperty({ description: 'Lista de IDs das clínicas onde o profissional atua' })
  @IsArray({ message: 'A lista de clínicas deve ser um array.' })
  @ArrayMinSize(1, { message: 'O profissional deve estar vinculado a pelo menos uma clínica.' })
  @IsUUID('4', { each: true, message: 'Cada ID de clínica deve ser um UUID válido.' })
  clinicIds: string[];
}
