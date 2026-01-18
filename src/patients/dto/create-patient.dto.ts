import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum, IsISO8601, Matches, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../entities/patient.entity';
import { isValid as isValidCpf } from 'cpf-cnpj-validator';

// Validação customizada para CPF
@ValidatorConstraint({ async: false })
export class IsCpfValidConstraint implements ValidatorConstraintInterface {
  validate(cpf: string, args: ValidationArguments) {
    return isValidCpf(cpf);
  }

  defaultMessage(args: ValidationArguments) {
    return 'O CPF informado é inválido.';
  }
}

export function IsCpfValid(validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCpfValidConstraint,
    });
  };
}

// Validação customizada para data de nascimento (não pode ser futura)
@ValidatorConstraint({ async: false })
export class IsPastDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string, args: ValidationArguments) {
    const date = new Date(dateString);
    return date < new Date();
  }

  defaultMessage(args: ValidationArguments) {
    return 'A data de nascimento não pode ser uma data futura.';
  }
}

export function IsPastDate(validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPastDateConstraint,
    });
  };
}
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../entities/patient.entity';

export class CreatePatientDto {
  @ApiProperty({ description: 'Nome completo do paciente' })
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  @IsString({ message: 'O nome completo deve ser uma string.' })
  fullName: string;

  @ApiProperty({ description: 'Data de nascimento (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'A data de nascimento é obrigatória.' })
  @IsISO8601({ strict: true }, { message: 'A data de nascimento deve estar no formato ISO8601 (YYYY-MM-DD).' })
  @IsPastDate({ message: 'A data de nascimento não pode ser uma data futura.' })
  birthDate: string;

  @ApiProperty({ description: 'Gênero do paciente', enum: Gender })
  @IsNotEmpty({ message: 'O gênero é obrigatório.' })
  @IsEnum(Gender, { message: `O gênero deve ser um dos seguintes valores: ${Object.values(Gender).join(', ')}` })
  gender: Gender;

  @ApiProperty({ description: 'CPF do paciente', required: false })
  @IsOptional()
  @IsString({ message: 'O CPF deve ser uma string.' })
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: 'O CPF deve estar no formato 000.000.000-00.' })
  @IsCpfValid({ message: 'O CPF informado é inválido.' })
  cpf?: string;

  @ApiProperty({ description: 'ID da clínica a qual o paciente está vinculado' })
  @IsNotEmpty({ message: 'O ID da clínica é obrigatório.' })
  @IsUUID('4', { message: 'O ID da clínica deve ser um UUID válido.' })
  clinicId: string;

  @ApiProperty({ description: 'ID do paciente responsável (para menores)', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'O ID do responsável deve ser um UUID válido.' })
  responsibleId?: string;
}
