import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.prisma.user.findFirst({
      where: { username },
      include: { phc: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'INACTIVE' || user.status === 'RESTRICTED') {
      throw new UnauthorizedException('User account is inactive or restricted');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Sign JWT token
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      phcId: user.phcId,
      status: user.status,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_SECRET') || 'change_this_secret',
      expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ||
        '1d') as any,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phcId: user.phcId,
        phcName: user.phc?.name || null,
        village: user.village,
        status: user.status,
      },
    };
  }

  async validateUserFromToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { phc: true },
    });

    if (!user || user.status === 'INACTIVE' || user.status === 'RESTRICTED') {
      throw new UnauthorizedException(
        'Session expired or user account is inactive or restricted',
      );
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phcId: user.phcId,
      phcName: user.phc?.name || null,
      village: user.village,
      status: user.status,
    };
  }
}
