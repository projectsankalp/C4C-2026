import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScreeningsService } from './screenings.service';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { UpdateScreeningStatusDto } from './dto/update-screening-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('screenings')
export class ScreeningsController {
  constructor(private readonly screeningsService: ScreeningsService) {}

  @Get()
  @Roles('ADMIN', 'DOCTOR')
  async findAll(
    @CurrentUser() currentUser: any,
    @Query('riskLevel') riskLevel?: string,
    @Query('status') status?: string,
    @Query('village') village?: string,
    @Query('search') search?: string,
  ) {
    return this.screeningsService.findAll(currentUser, {
      riskLevel,
      status,
      village,
      search,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'ASHA')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.screeningsService.findOne(id, currentUser);
  }

  @Post()
  @Roles('ADMIN', 'DOCTOR', 'ASHA')
  async create(@Body() createScreeningDto: CreateScreeningDto) {
    return this.screeningsService.create(createScreeningDto);
  }

  @Patch(':id/status')
  @Roles('DOCTOR')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateScreeningStatusDto: UpdateScreeningStatusDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.screeningsService.update(
      id,
      updateScreeningStatusDto,
      currentUser,
    );
  }

  @Patch(':id/clinical')
  @Roles('DOCTOR')
  async updateClinical(
    @Param('id') id: string,
    @Body() updateDto: any,
    @CurrentUser() currentUser: any,
  ) {
    return this.screeningsService.update(id, updateDto, currentUser);
  }

  @Patch(':id')
  @Roles('DOCTOR')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @CurrentUser() currentUser: any,
  ) {
    return this.screeningsService.update(id, updateDto, currentUser);
  }
}
