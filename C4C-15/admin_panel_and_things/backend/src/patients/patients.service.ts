import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUser: { role: string; phcId?: string }) {
    if (currentUser.role === 'DOCTOR') {
      if (!currentUser.phcId) {
        return [];
      }
      return this.prisma.patient.findMany({
        where: {
          screenings: {
            some: {
              phcId: currentUser.phcId,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // ADMIN sees all patients
    return this.prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUser: { role: string; phcId?: string }) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        screenings: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // If DOCTOR, double check authorization by ensuring at least one screening was at their PHC
    if (currentUser.role === 'DOCTOR') {
      const hasAccess = patient.screenings.some(
        (s) => s.phcId === currentUser.phcId,
      );
      if (!hasAccess) {
        throw new NotFoundException('Patient not found in your PHC center');
      }
    }

    return patient;
  }

  async create(createPatientDto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: createPatientDto,
    });
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    currentUser: { role: string; phcId?: string },
  ) {
    // Check if patient exists and is visible
    await this.findOne(id, currentUser);

    return this.prisma.patient.update({
      where: { id },
      data: updatePatientDto,
    });
  }
}
