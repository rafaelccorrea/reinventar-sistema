import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabela Clinics
    await queryRunner.query(`
        CREATE TABLE "clinics" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "cnpj" character varying,
            "is_active" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "UQ_clinics_name" UNIQUE ("name"),
            CONSTRAINT "PK_clinics_id" PRIMARY KEY ("id")
        );
    `);

    // Tabela Permissions
    await queryRunner.query(`
        CREATE TABLE "permissions" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "is_active" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
            CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id")
        );
    `);

    // Tabela Roles
    await queryRunner.query(`
        CREATE TABLE "roles" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "is_active" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
            CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
        );
    `);

    // Tabela Role_Permissions (N:M)
    await queryRunner.query(`
        CREATE TABLE "role_permissions" (
            "role_id" uuid NOT NULL,
            "permission_id" uuid NOT NULL,
            CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id")
        );
    `);

    // Tabela Users
    await queryRunner.query(`
        CREATE TABLE "users" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "email" character varying NOT NULL,
            "password_hash" character varying NOT NULL,
            "name" character varying NOT NULL,
            "is_active" boolean NOT NULL DEFAULT true,
            "role_id" uuid NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "UQ_users_email" UNIQUE ("email"),
            CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
        );
    `);

    // Tabela User_Clinics (N:M)
    await queryRunner.query(`
        CREATE TABLE "user_clinics" (
            "user_id" uuid NOT NULL,
            "clinic_id" uuid NOT NULL,
            CONSTRAINT "PK_user_clinics" PRIMARY KEY ("user_id", "clinic_id")
        );
    `);

    // Tabela Audit_Logs
    await queryRunner.query(`
        CREATE TABLE "audit_logs" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "action" character varying NOT NULL,
            "user_id" character varying,
            "target_id" character varying,
            "details" jsonb,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
        );
    `);

    // Tabela Patients
    await queryRunner.query(`
        CREATE TABLE "patients" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "cpf" character varying,
            "date_of_birth" date NOT NULL,
            "gender" character varying NOT NULL,
            "responsible_id" uuid,
            "clinic_id" uuid NOT NULL,
            "health_insurance_id" uuid,
            "is_active" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "UQ_patients_cpf" UNIQUE ("cpf"),
            CONSTRAINT "PK_patients_id" PRIMARY KEY ("id")
        );
    `);

    // Tabela Professionals
    await queryRunner.query(`
        CREATE TABLE "professionals" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "user_id" uuid NOT NULL,
            "registration_number" character varying NOT NULL,
            "council" character varying NOT NULL,
            "is_active" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "UQ_professionals_user_id" UNIQUE ("user_id"),
            CONSTRAINT "UQ_professionals_reg_council" UNIQUE ("registration_number", "council"),
            CONSTRAINT "PK_professionals_id" PRIMARY KEY ("id")
        );
    `);

    // Tabela Professional_Clinics (N:M)
    await queryRunner.query(`
        CREATE TABLE "professional_clinics" (
            "professional_id" uuid NOT NULL,
            "clinic_id" uuid NOT NULL,
            CONSTRAINT "PK_professional_clinics" PRIMARY KEY ("professional_id", "clinic_id")
        );
    `);

    // Tabela Appointments
    await queryRunner.query(`
        CREATE TABLE "appointments" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "patient_id" uuid NOT NULL,
            "professional_id" uuid NOT NULL,
            "clinic_id" uuid NOT NULL,
            "start_time" TIMESTAMP WITH TIME ZONE NOT NULL,
            "end_time" TIMESTAMP WITH TIME ZONE NOT NULL,
            "status" character varying NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "PK_appointments_id" PRIMARY KEY ("id")
        );
    `);

    // Tabela Clinical_Evolutions
    await queryRunner.query(`
        CREATE TABLE "clinical_evolutions" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "patient_id" uuid NOT NULL,
            "professional_id" uuid NOT NULL,
            "appointment_id" uuid,
            "evolution_type" character varying NOT NULL,
            "content" text NOT NULL,
            "is_finalized" boolean NOT NULL DEFAULT false,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "UQ_clinical_evolutions_appointment_id" UNIQUE ("appointment_id"),
            CONSTRAINT "PK_clinical_evolutions_id" PRIMARY KEY ("id")
        );
    `);

    // Tabela Health_Insurances
    await queryRunner.query(`
        CREATE TABLE "health_insurances" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "cnpj" character varying,
            "session_price" numeric(10,2) NOT NULL DEFAULT '0.00',
            "is_active" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "UQ_health_insurances_name" UNIQUE ("name"),
            CONSTRAINT "PK_health_insurances_id" PRIMARY KEY ("id")
        );
    `);

    // Tabela Financial_Transactions
    await queryRunner.query(`
        CREATE TABLE "financial_transactions" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "type" character varying NOT NULL,
            "amount" numeric(10,2) NOT NULL,
            "description" character varying NOT NULL,
            "payment_method" character varying,
            "transaction_date" date NOT NULL,
            "appointment_id" uuid,
            "patient_id" uuid,
            "health_insurance_id" uuid,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "UQ_financial_transactions_appointment_id" UNIQUE ("appointment_id"),
            CONSTRAINT "PK_financial_transactions_id" PRIMARY KEY ("id")
        );
    `);

    // Adicionar Foreign Keys (simplificado)
    // ...
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter todas as tabelas
    await queryRunner.query(`DROP TABLE "financial_transactions"`);
    await queryRunner.query(`DROP TABLE "health_insurances"`);
    await queryRunner.query(`DROP TABLE "clinical_evolutions"`);
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TABLE "professional_clinics"`);
    await queryRunner.query(`DROP TABLE "professionals"`);
    await queryRunner.query(`DROP TABLE "patients"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "user_clinics"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "clinics"`);
  }
}
