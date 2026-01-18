import { PartialType } from '@nestjs/swagger';
import { CreateClinicalEvolutionDto } from './create-clinical-evolution.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClinicalEvolutionDto extends PartialType(CreateClinicalEvolutionDto) {
  @ApiProperty({ description: 'Indica se a evolução está finalizada e não deve ser alterada', required: false })
  @IsOptional()
  @IsBoolean({ message: 'O campo isFinalized deve ser um booleano.' })
  isFinalized?: boolean;
}
