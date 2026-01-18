import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { Clinic } from '../clinics/entities/clinic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Patient, Professional, Clinic])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
