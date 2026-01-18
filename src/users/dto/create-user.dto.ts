import { IsEmail, IsNotEmpty, IsString, MinLength, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Nome completo do usuário' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  name: string;

  @ApiProperty({ description: 'Email do usuário', example: 'novo.usuario@reinventar.com' })
  @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;

  @ApiProperty({ description: 'Senha do usuário', example: 'senhaSegura123' })
  @IsString({ message: 'A senha deve ser uma string.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  password: string;

  @ApiProperty({ description: 'ID da Role (Perfil de Acesso)' })
  @IsNotEmpty({ message: 'O ID da Role é obrigatório.' })
  @IsUUID('4', { message: 'O ID da Role deve ser um UUID válido.' })
  roleId: string;

  @ApiProperty({ description: 'IDs das Clínicas vinculadas', type: [String] })
  @IsNotEmpty({ message: 'O vínculo com clínicas é obrigatório.' })
  @IsUUID('4', { each: true, message: 'Cada ID de clínica deve ser um UUID válido.' })
  clinicIds: string[];

  @ApiProperty({ description: 'Status de atividade', required: false, default: true })
  @IsOptional()
  @IsBoolean({ message: 'O status de atividade deve ser um booleano.' })
  isActive?: boolean;
}
