import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(action: string, userId: string, targetId: string, details?: any): Promise<AuditLog> {
    const logEntry = this.auditLogRepository.create({
      action,
      userId,
      targetId,
      details,
    });
    return this.auditLogRepository.save(logEntry);
  }
}
