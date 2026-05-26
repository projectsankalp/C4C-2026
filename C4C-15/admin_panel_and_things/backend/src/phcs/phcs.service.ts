import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhcDto } from './dto/create-phc.dto';
import { UpdatePhcDto } from './dto/update-phc.dto';

@Injectable()
export class PhcsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const phcs = await this.prisma.pHC.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: { role: true, village: true },
        },
      },
    });

    return phcs.map((phc) => {
      const doctorsCount = phc.users.filter((u) => u.role === 'DOCTOR').length;
      const ashaCount = phc.users.filter((u) => u.role === 'ASHA').length;
      const villages = new Set(
        phc.users
          .filter((u) => u.role === 'ASHA' && u.village)
          .map((u) => u.village),
      );

      return {
        id: phc.id,
        name: phc.name,
        district: phc.district,
        status: phc.active ? 'ACTIVE' : 'INACTIVE',
        doctorsCount,
        ashaCount,
        villagesCovered: villages.size,
      };
    });
  }

  async findOne(id: string) {
    const phc = await this.prisma.pHC.findUnique({
      where: { id },
    });

    if (!phc) {
      throw new NotFoundException('PHC not found');
    }

    return phc;
  }

  async create(createPhcDto: CreatePhcDto) {
    return this.prisma.pHC.create({
      data: {
        name: createPhcDto.name,
        district: createPhcDto.district,
        state: createPhcDto.state,
        active: createPhcDto.active !== undefined ? createPhcDto.active : true,
      },
    });
  }

  async update(id: string, updatePhcDto: UpdatePhcDto) {
    const phc = await this.prisma.pHC.findUnique({
      where: { id },
    });

    if (!phc) {
      throw new NotFoundException('PHC not found');
    }

    return this.prisma.pHC.update({
      where: { id },
      data: updatePhcDto,
    });
  }
}
