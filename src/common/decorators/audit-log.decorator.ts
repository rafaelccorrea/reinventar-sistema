import { SetMetadata } from '@nestjs/common';

export const AuditLog = (action: string) => SetMetadata('auditAction', action);
