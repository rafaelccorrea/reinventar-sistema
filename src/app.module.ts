import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { dataSourceOptions } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClinicalEvolutionsModule } from './clinical-evolutions/clinical-evolutions.module';
import { FinanceModule } from './finance/finance.module';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: '"No Reply" <noreply@reinventar.com>',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000,
            limit: 100,
          },
          {
            name: 'auth',
            ttl: 60000,
            limit: 5,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PatientsModule,
    ProfessionalsModule,
    AppointmentsModule,
    ClinicalEvolutionsModule,
    FinanceModule,
    CommonModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
