import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../users/user.entity';
import { Role } from '../../auth/entities/role.entity';
import { Permission } from '../../auth/entities/permission.entity';
import * as bcrypt from 'bcrypt';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);
    
    // 1. Criar Permissões de Gestão de Usuários
    const permissions = [
      'manage:all', 
      'users:create', 
      'users:read', 
      'users:update', 
      'users:delete',
      'patients:create',
      'patients:read',
      'patients:update',
      'patients:delete',
      'view:patients', 
      'edit:appointments'
    ];
    
    for (const pName of permissions) {
      const exists = await permissionRepository.findOneBy({ name: pName });
      if (!exists) {
        await permissionRepository.save(permissionRepository.create({ name: pName }));
      }
    }

    // 2. Criar Role ADMIN com todas as permissões
    let adminRole = await roleRepository.findOne({ 
      where: { name: 'ADMIN' },
      relations: ['permissions'] 
    });
    if (!adminRole) {
      const allPermissions = await permissionRepository.find();
      adminRole = await roleRepository.save(roleRepository.create({
        name: 'ADMIN',
        permissions: allPermissions
      }));
    } else {
      // Atualizar permissões do admin caso novas tenham sido adicionadas
      adminRole.permissions = await permissionRepository.find();
      await roleRepository.save(adminRole);
    }

    // 3. Criar Usuário Admin Padrão
    const userEmail = 'admin@reinventar.com';
    const userExists = await userRepository.findOne({ 
      where: { email: userEmail },
      relations: ['roles']
    });

    if (!userExists) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('123456', salt);
      
      const newUser = userRepository.create({
        email: userEmail,
        password: hashedPassword,
        name: 'Administrador Sistema',
        roles: [adminRole],
        isActive: true,
      });

      await userRepository.save(newUser);
      console.log('Usuário padrão criado com sucesso: admin@reinventar.com / 123456');
    } else {
      userExists.roles = [adminRole];
      userExists.name = 'Administrador Sistema';
      await userRepository.save(userExists);
      console.log('Usuário padrão atualizado com permissões de gestão.');
    }
  }
}
