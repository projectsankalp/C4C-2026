import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello() {
    return {
      app: 'Asha+ API',
      status: 'running',
    };
  }

  @Get('health')
  @Public()
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
