import { Module } from '@nestjs/common';
import { MobileFeedController } from './mobile-feed.controller';
import { MobileFeedService } from './mobile-feed.service';

@Module({
  controllers: [MobileFeedController],
  providers: [MobileFeedService],
})
export class MobileFeedModule {}