import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PhcsService } from './phcs.service';
import { CreatePhcDto } from './dto/create-phc.dto';
import { UpdatePhcDto } from './dto/update-phc.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('phcs')
export class PhcsController {
  constructor(private readonly phcsService: PhcsService) {}

  @Get()
  async findAll() {
    return this.phcsService.findAll();
  }

  @Post()
  async create(@Body() createPhcDto: CreatePhcDto) {
    return this.phcsService.create(createPhcDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.phcsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePhcDto: UpdatePhcDto) {
    return this.phcsService.update(id, updatePhcDto);
  }
}
