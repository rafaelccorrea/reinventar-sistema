import { PartialType } from '@nestjs/swagger';
import { CreateProfessionalDto } from './create-professional.dto';
import { IsOptional, IsArray, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfessionalDto extends PartialType(CreateProfessionalDto) {
  @ApiProperty({ description: 'Lista de IDs das clínicas onde o profissional atua', required: false })
  @IsOptional()
  @IsArray({ message: 'A lista de clínicas deve ser um array.' })
  @ArrayMinSize(1, { message: 'O profissional deve estar vinculado a pelo menos uma clínica.' })
  @IsUUID('4', { each: true, message: 'Cada ID de clínica deve ser um UUID válido.' })
  clinicIds?: string[];
}
