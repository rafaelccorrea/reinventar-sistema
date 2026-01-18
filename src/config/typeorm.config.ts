import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Permission } from '../users/entities/permission.entity';
import { Clinic } from '../users/entities/clinic.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ClinicalEvolution } from '../clinical-evolutions/entities/clinical-evolution.entity';
import { HealthInsurance } from '../finance/entities/health-insurance.entity';
import { FinancialTransaction } from '../finance/entities/financial-transaction.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'reinventar_db',
  entities: [
    User,
    Role,
    Permission,
    Clinic,
    Patient,
    Professional,
    Appointment,
    ClinicalEvolution,
    HealthInsurance,
    FinancialTransaction,
  ],
  migrations: ['dist/src/migrations/*.js'],
  migrationsTableName: 'migrations_history',
  synchronize: false, // Deve ser false em produção
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
