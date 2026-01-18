import { IsNotEmpty, IsUUID, IsString, IsOptional, IsEnum, IsNumber, IsPositive, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, PaymentMethod } from '../entities/financial-transaction.entity';

export class CreateFinancialTransactionDto {
  @ApiProperty({ description: 'Tipo de transação', enum: TransactionType })
  @IsNotEmpty({ message: 'O tipo de transação é obrigatório.' })
  @IsEnum(TransactionType, { message: `O tipo deve ser um dos seguintes valores: ${Object.values(TransactionType).join(', ')}` })
  type: TransactionType;

  @ApiProperty({ description: 'Valor da transação', type: 'number' })
  @IsNotEmpty({ message: 'O valor é obrigatório.' })
  @IsNumber({}, { message: 'O valor deve ser um número.' })
  @IsPositive({ message: 'O valor deve ser um valor positivo.' })
  amount: number;

  @ApiProperty({ description: 'Descrição da transação' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @IsString({ message: 'A descrição deve ser uma string.' })
  description: string;

  @ApiProperty({ description: 'Método de pagamento (obrigatório para Receita)', enum: PaymentMethod, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: `O método de pagamento deve ser um dos seguintes valores: ${Object.values(PaymentMethod).join(', ')}` })
  paymentMethod?: PaymentMethod;

  @ApiProperty({ description: 'Data da transação (ISO 8601)', default: new Date().toISOString().split('T')[0] })
  @IsNotEmpty({ message: 'A data da transação é obrigatória.' })
  @IsISO8601({ strict: true }, { message: 'A data da transação deve estar no formato ISO8601 (YYYY-MM-DD).' })
  transactionDate: string;

  @ApiProperty({ description: 'ID do agendamento relacionado (para faturamento de sessão)', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'O ID do agendamento deve ser um UUID válido.' })
  appointmentId?: string;

  @ApiProperty({ description: 'ID do paciente relacionado (para pagamentos particulares)', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'O ID do paciente deve ser um UUID válido.' })
  patientId?: string;

  @ApiProperty({ description: 'ID do convênio relacionado (para faturamento de convênio)', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'O ID do convênio deve ser um UUID válido.' })
  healthInsuranceId?: string;
}
