import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@CurrentUser() currentUser: any) {
    return this.notificationsService.getNotifications(currentUser);
  }
}
