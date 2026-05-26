import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FollowupsService } from './followups.service';
import { CreateFollowupDto } from './dto/create-followup.dto';
import { UpdateFollowupStatusDto } from './dto/update-followup-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  @Get('followups')
  @Roles('ADMIN', 'DOCTOR', 'ASHA')
  async findAll(@CurrentUser() currentUser: any) {
    return this.followupsService.findAll(currentUser);
  }

  @Post('screenings/:id/followup')
  @Roles('DOCTOR')
  async create(
    @Param('id') screeningId: string,
    @Body() createFollowupDto: CreateFollowupDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.followupsService.create(
      screeningId,
      createFollowupDto,
      currentUser,
    );
  }

  @Patch('followups/:id/status')
  @Roles('ADMIN', 'ASHA')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateFollowupStatusDto: UpdateFollowupStatusDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.followupsService.updateStatus(
      id,
      updateFollowupStatusDto,
      currentUser,
    );
  }
}
