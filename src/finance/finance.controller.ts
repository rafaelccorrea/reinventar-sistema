import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateHealthInsuranceDto } from './dto/create-health-insurance.dto';
import { UpdateHealthInsuranceDto } from './dto/update-health-insurance.dto';
import { CreateFinancialTransactionDto } from './dto/create-financial-transaction.dto';
import { UpdateFinancialTransactionDto } from './dto/update-financial-transaction.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@ApiTags('Finance (Convênios e Transações)')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // --- Health Insurance (Convênios) ---

  @Post('insurances')
  @Permissions('insurances:create')
  @AuditLog('CREATE_INSURANCE')
  @ApiOperation({ summary: 'Cadastrar um novo convênio' })
  @ApiResponse({ status: 201, description: 'Convênio cadastrado com sucesso.' })
  createInsurance(@Body() dto: CreateHealthInsuranceDto) {
    return this.financeService.createInsurance(dto);
  }

  @Get('insurances')
  @Permissions('insurances:read')
  @ApiOperation({ summary: 'Listar todos os convênios' })
  @ApiResponse({ status: 200, description: 'Lista de convênios retornada com sucesso.' })
  findAllInsurances() {
    return this.financeService.findAllInsurances();
  }

  @Patch('insurances/:id')
  @Permissions('insurances:update')
  @AuditLog('UPDATE_INSURANCE')
  @ApiOperation({ summary: 'Atualizar dados de um convênio' })
  @ApiResponse({ status: 200, description: 'Convênio atualizado com sucesso.' })
  updateInsurance(@Param('id') id: string, @Body() dto: UpdateHealthInsuranceDto) {
    return this.financeService.updateInsurance(id, dto);
  }

  @Delete('insurances/:id')
  @Permissions('insurances:delete')
  @AuditLog('DELETE_INSURANCE')
  @ApiOperation({ summary: 'Remover um convênio (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Convênio removido com sucesso.' })
  removeInsurance(@Param('id') id: string) {
    return this.financeService.removeInsurance(id);
  }

  // --- Financial Transactions (Transações) ---

  @Post('transactions')
  @Permissions('transactions:create')
  @AuditLog('CREATE_TRANSACTION')
  @ApiOperation({ summary: 'Registrar uma nova transação financeira (Receita/Despesa)' })
  @ApiResponse({ status: 201, description: 'Transação registrada com sucesso.' })
  createTransaction(@Body() dto: CreateFinancialTransactionDto) {
    return this.financeService.createTransaction(dto);
  }

  @Get('transactions')
  @Permissions('transactions:read')
  @ApiOperation({ summary: 'Listar todas as transações financeiras' })
  @ApiResponse({ status: 200, description: 'Lista de transações retornada com sucesso.' })
  findAllTransactions() {
    return this.financeService.findAllTransactions();
  }

  @Patch('transactions/:id')
  @Permissions('transactions:update')
  @AuditLog('UPDATE_TRANSACTION')
  @ApiOperation({ summary: 'Atualizar dados de uma transação financeira' })
  @ApiResponse({ status: 200, description: 'Transação atualizada com sucesso.' })
  updateTransaction(@Param('id') id: string, @Body() dto: UpdateFinancialTransactionDto) {
    return this.financeService.updateTransaction(id, dto);
  }

  @Delete('transactions/:id')
  @Permissions('transactions:delete')
  @AuditLog('DELETE_TRANSACTION')
  @ApiOperation({ summary: 'Remover uma transação financeira (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Transação removida com sucesso.' })
  removeTransaction(@Param('id') id: string) {
    return this.financeService.removeTransaction(id);
  }

  // --- Faturamento ---

  @Post('invoice/:appointmentId')
  @Permissions('transactions:create')
  @AuditLog('GENERATE_INVOICE')
  @ApiOperation({ summary: 'Gerar transação de faturamento para um agendamento realizado' })
  @ApiResponse({ status: 201, description: 'Faturamento gerado com sucesso.' })
  generateInvoice(@Param('appointmentId') appointmentId: string) {
    return this.financeService.generateInvoiceForCompletedAppointment(appointmentId);
  }
}
