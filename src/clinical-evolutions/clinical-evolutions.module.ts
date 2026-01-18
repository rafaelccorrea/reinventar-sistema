import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalEvolutionsService } from './clinical-evolutions.service';
import { ClinicalEvolutionsController } from './clinical-evolutions.controller';
import { ClinicalEvolution } from './entities/clinical-evolution.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalEvolution, Patient, Professional, Appointment])],
  controllers: [ClinicalEvolutionsController],
  providers: [ClinicalEvolutionsService],
  exports: [ClinicalEvolutionsService],
})
export class ClinicalEvolutionsModule {}
