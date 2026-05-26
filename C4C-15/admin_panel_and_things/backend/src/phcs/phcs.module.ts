import { Module } from '@nestjs/common';
import { PhcsService } from './phcs.service';
import { PhcsController } from './phcs.controller';

@Module({
  providers: [PhcsService],
  controllers: [PhcsController],
  exports: [PhcsService],
})
export class PhcsModule {}
