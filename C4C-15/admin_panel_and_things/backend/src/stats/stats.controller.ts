import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('doctor')
  @Roles('DOCTOR')
  async getDoctorStats(@CurrentUser() currentUser: any) {
    return this.statsService.getDoctorStats(currentUser);
  }

  @Get('admin')
  @Roles('ADMIN')
  async getAdminStats() {
    return this.statsService.getAdminStats();
  }

  @Get('system')
  @Roles('ADMIN')
  async getSystemStats() {
    return this.statsService.getSystemStats();
  }

  @Get('village-risk')
  @Roles('ADMIN')
  async getVillageRisk() {
    return this.statsService.getVillageRiskHeatmap();
  }
}
