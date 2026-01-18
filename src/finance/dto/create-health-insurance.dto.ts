import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsPositive, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHealthInsuranceDto {
  @ApiProperty({ description: 'Nome do convênio' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  name: string;

  @ApiProperty({ description: 'CNPJ do convênio', required: false })
  @IsOptional()
  @IsString({ message: 'O CNPJ deve ser uma string.' })
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, { message: 'O CNPJ deve estar no formato 00.000.000/0000-00.' })
  cnpj?: string;

  @ApiProperty({ description: 'Valor padrão da sessão para este convênio', type: 'number' })
  @IsNotEmpty({ message: 'O preço da sessão é obrigatório.' })
  @IsNumber({}, { message: 'O preço da sessão deve ser um número.' })
  @IsPositive({ message: 'O preço da sessão deve ser um valor positivo.' })
  sessionPrice: number;

  @ApiProperty({ description: 'Status de atividade do convênio', required: false, default: true })
  @IsOptional()
  @IsBoolean({ message: 'O status de atividade deve ser um booleano.' })
  isActive?: boolean;
}
