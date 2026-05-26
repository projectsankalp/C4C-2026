import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

// Internal Modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PhcsModule } from './phcs/phcs.module';
import { PatientsModule } from './patients/patients.module';
import { ScreeningsModule } from './screenings/screenings.module';
import { FollowupsModule } from './followups/followups.module';
import { StatsModule } from './stats/stats.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MobileFeedModule } from './mobile-feed/mobile-feed.module';

@Module({
  imports: [
    // Global Configurations
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // max 100 requests per minute
      },
    ]),

    // Database & Authentication
    PrismaModule,
    AuthModule,

    // Domain Modules
    UsersModule,
    PhcsModule,
    PatientsModule,
    ScreeningsModule,
    FollowupsModule,
    StatsModule,
    NotificationsModule,
    MobileFeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
