import { PartialType } from '@nestjs/swagger';
import { CreateHealthInsuranceDto } from './create-health-insurance.dto';

export class UpdateHealthInsuranceDto extends PartialType(CreateHealthInsuranceDto) {}
