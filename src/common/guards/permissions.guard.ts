import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assumindo que o JWT Guard já anexou o usuário ao request

    if (!user || !user.permissions) {
      return false;
    }

    const userPermissions = user.permissions.map(p => p.name);

    return requiredPermissions.every(perm => userPermissions.includes(perm));
  }
}
