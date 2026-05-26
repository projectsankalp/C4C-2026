import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles('ADMIN', 'DOCTOR')
  async findAll(@CurrentUser() currentUser: any) {
    return this.patientsService.findAll(currentUser);
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.patientsService.findOne(id, currentUser);
  }

  @Post()
  @Roles('ADMIN', 'DOCTOR')
  async create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DOCTOR')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.patientsService.update(id, updatePatientDto, currentUser);
  }
}
