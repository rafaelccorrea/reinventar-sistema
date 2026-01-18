import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Role } from '../../users/entities/role.entity';
import { Permission } from '../../users/entities/permission.entity';
import { Clinic } from '../../users/entities/clinic.entity';
import { User } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export default class InitialSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    // 1. Criar Permissões
    const allPermissions = [
      'users:create', 'users:read', 'users:update', 'users:delete',
      'roles:create', 'roles:read', 'roles:update', 'roles:delete',
      'clinics:create', 'clinics:read', 'clinics:update', 'clinics:delete',
      'patients:create', 'patients:read', 'patients:update', 'patients:delete',
      'professionals:create', 'professionals:read', 'professionals:update', 'professionals:delete',
      'appointments:create', 'appointments:read', 'appointments:update', 'appointments:delete',
      'evolutions:create', 'evolutions:read', 'evolutions:update', 'evolutions:delete',
      'insurances:create', 'insurances:read', 'insurances:update', 'insurances:delete',
      'transactions:create', 'transactions:read', 'transactions:update', 'transactions:delete',
    ];

    const permissions = await Promise.all(
      allPermissions.map(name => connection.getRepository(Permission).save({ name })),
    );

    const permissionMap = permissions.reduce((acc, perm) => {
      acc[perm.name] = perm;
      return acc;
    }, {});

    // 2. Criar Roles
    const adminRole = await connection.getRepository(Role).save({
      name: 'ADMIN',
      permissions: permissions, // Admin tem todas as permissões
    });

    const professionalRole = await connection.getRepository(Role).save({
      name: 'PROFESSIONAL',
      permissions: [
        permissionMap['patients:read'],
        permissionMap['appointments:read'],
        permissionMap['appointments:update'],
        permissionMap['evolutions:create'],
        permissionMap['evolutions:read'],
        permissionMap['evolutions:update'],
      ],
    });

    const secretaryRole = await connection.getRepository(Role).save({
      name: 'SECRETARY',
      permissions: [
        permissionMap['patients:create'],
        permissionMap['patients:read'],
        permissionMap['patients:update'],
        permissionMap['appointments:create'],
        permissionMap['appointments:read'],
        permissionMap['appointments:update'],
        permissionMap['appointments:delete'],
      ],
    });

    // 3. Criar Clínica Padrão
    const clinic = await connection.getRepository(Clinic).save({
      name: 'Clínica Matriz - Reinventar',
      cnpj: '00.000.000/0001-00',
    });

    // 4. Criar Usuário Admin
    const passwordHash = await bcrypt.hash('admin123', 10);
    await connection.getRepository(User).save({
      name: 'Administrador do Sistema',
      email: 'admin@reinventar.com',
      passwordHash,
      roleId: adminRole.id,
      clinics: [clinic],
    });
  }
}
