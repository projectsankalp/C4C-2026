import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { role?: string; status?: string; search?: string }) {
    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        village: true,
        status: true,
        phcId: true,
        phc: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      loginId: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      phcId: user.phcId,
      phcName: user.phc?.name || null,
      village: user.village,
      lastActive: user.updatedAt,
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { phc: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      loginId: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      phcId: user.phcId,
      phcName: user.phc?.name || null,
      village: user.village,
      lastActive: user.updatedAt,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { name, username, email, role, password, village, phcId, status } =
      createUserDto as any;

    const normalizedUsername = String(username || '')
      .trim()
      .toLowerCase();
    const normalizedEmail = String(email || '')
      .trim()
      .toLowerCase();
    const resolvedEmail =
      normalizedEmail || `${normalizedUsername}@asha.local`;

    if (role === 'ADMIN') {
      throw new ForbiddenException('Cannot create ADMIN users via API');
    }

    if (!normalizedUsername) {
      throw new BadRequestException('Username is required');
    }

    const existingByUsername = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existingByUsername) {
      throw new BadRequestException('User with this username already exists');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: resolvedEmail },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let resolvedPhcId: string | null = null;
    if (phcId) {
      const phcById = await this.prisma.pHC.findUnique({
        where: { id: phcId },
      });
      if (phcById) {
        resolvedPhcId = phcById.id;
      } else {
        const phcByName = await this.prisma.pHC.findFirst({
          where: { name: { contains: phcId, mode: 'insensitive' } },
        });
        if (phcByName) {
          resolvedPhcId = phcByName.id;
        }
      }
    }

    return this.prisma.user.create({
      data: {
        name,
        email: resolvedEmail,
        username: normalizedUsername,
        role,
        passwordHash,
        village: village || null,
        phcId: resolvedPhcId,
        status: status || 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        village: true,
        status: true,
        phcId: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot update ADMIN users');
    }

    const data: any = { ...updateUserDto };

    if (data.role === 'ADMIN') {
      throw new ForbiddenException('Cannot assign ADMIN role');
    }

    if (typeof data.username === 'string') {
      const normalizedUsername = data.username.trim().toLowerCase();
      if (!normalizedUsername) {
        throw new BadRequestException('Username is required');
      }

      const existingByUsername = await this.prisma.user.findUnique({
        where: { username: normalizedUsername },
      });
      if (existingByUsername && existingByUsername.id !== id) {
        throw new BadRequestException('User with this username already exists');
      }

      data.username = normalizedUsername;
    }

    if (typeof data.phcId === 'string') {
      let resolvedPhcId: string | null = null;
      const phcById = await this.prisma.pHC.findUnique({
        where: { id: data.phcId },
      });
      if (phcById) {
        resolvedPhcId = phcById.id;
      } else {
        const phcByName = await this.prisma.pHC.findFirst({
          where: { name: { contains: data.phcId, mode: 'insensitive' } },
        });
        if (phcByName) {
          resolvedPhcId = phcByName.id;
        }
      }
      data.phcId = resolvedPhcId;
    }

    if (data.password) {
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        village: true,
        status: true,
        phcId: true,
        updatedAt: true,
      },
    });
  }

  async updatePassword(id: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot update password of ADMIN users');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot change status of ADMIN users');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot delete ADMIN users');
    }

    await this.prisma.$transaction(async (tx) => {
      // Remove follow-ups where this user is assigned as ASHA or doctor.
      await tx.followUp.deleteMany({
        where: {
          OR: [{ assignedToAshaId: id }, { doctorId: id }],
        },
      });

      // Remove screenings created by this ASHA user and any follow-ups linked to those screenings.
      const screeningIds = await tx.screening.findMany({
        where: { ashaId: id },
        select: { id: true },
      });
      const ids = screeningIds.map((s) => s.id);

      if (ids.length > 0) {
        await tx.followUp.deleteMany({
          where: { screeningId: { in: ids } },
        });
        await tx.screening.deleteMany({
          where: { id: { in: ids } },
        });
      }

      await tx.user.delete({ where: { id } });
    });

    return {
      success: true,
      message: 'Personnel permanently deleted',
    };
  }
}
