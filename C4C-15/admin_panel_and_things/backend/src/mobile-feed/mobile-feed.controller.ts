import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { MobileFeedService } from './mobile-feed.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('mobile-feed')
export class MobileFeedController {
  constructor(private readonly mobileFeedService: MobileFeedService) {}

  @Get('doctor')
  getDoctorWorkspaceFeed() {
    return this.mobileFeedService.getDoctorWorkspaceFeed();
  }

  @Patch('screenings/:id/status')
  updateScreeningStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.mobileFeedService.updateScreeningStatus(id, body.status);
  }

  @Patch('screenings/:id')
  updateScreeningClinical(
    @Param('id') id: string,
    @Body() body: {
      doctorNotes?: string;
      diagnosis?: string;
      prescription?: string;
      status?: string;
    },
    @CurrentUser() currentUser: any,
  ) {
    return this.mobileFeedService.updateScreeningClinical(id, {
      ...body,
      resolvedBy: currentUser?.name || 'Doctor',
    });
  }
}