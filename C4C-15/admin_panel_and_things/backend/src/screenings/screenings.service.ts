import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { UpdateScreeningStatusDto } from './dto/update-screening-status.dto';

@Injectable()
export class ScreeningsService {
  constructor(private readonly prisma: PrismaService) {}

  private formatScreening(s: any, role?: string) {
    let parsedReasons = [];
    try {
      parsedReasons =
        typeof s.riskReasons === 'string'
          ? JSON.parse(s.riskReasons)
          : s.riskReasons;
      if (!Array.isArray(parsedReasons)) {
        parsedReasons = [];
      }
    } catch (e) {
      parsedReasons = [];
    }

    return {
      id: s.id,
      patientId: s.patient?.id || null,
      name: s.patient?.name || null,
      age: s.patient?.age || null,
      gender: s.patient?.gender || null,
      village: s.patient?.village || null,
      houseNumber: s.patient?.houseNumber || null,
      phone: s.patient?.phone || null,
      bp: s.bpSystolic ? `${s.bpSystolic}/${s.bpDiastolic}` : null,
      sugar: s.sugar,
      riskLevel: s.riskLevel,
      status: s.status,
      ashaName: s.asha?.name || null,
      phcName: s.phc?.name || null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      doctorNotes: role === 'ADMIN' ? undefined : s.doctorNotes,
      diagnosis: role === 'ADMIN' ? undefined : s.diagnosis,
      prescription: role === 'ADMIN' ? undefined : s.prescription,
      resolvedAt: s.resolvedAt,
      resolvedBy: s.resolvedBy,
    };
  }

  async findAll(
    currentUser: { role: string; phcId?: string; id: string },
    filters: {
      riskLevel?: string;
      status?: string;
      village?: string;
      search?: string;
    },
  ) {
    const where: any = {};

    // 1. Role-based restrictions
    if (currentUser.role === 'DOCTOR') {
      if (!currentUser.phcId) {
        return [];
      }
      where.phcId = currentUser.phcId;
    } else if (currentUser.role === 'ASHA') {
      where.ashaId = currentUser.id;
    }

    // 2. Query filter parameters
    if (filters.riskLevel) {
      where.riskLevel = filters.riskLevel;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.village) {
      where.patient = {
        village: filters.village,
      };
    }

    if (filters.search) {
      if (where.patient) {
        where.patient.name = { contains: filters.search };
      } else {
        where.patient = {
          name: { contains: filters.search },
        };
      }
    }

    const screenings = await this.prisma.screening.findMany({
      where,
      include: {
        patient: true,
        asha: true,
        phc: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return screenings.map((s) => this.formatScreening(s, currentUser.role));
  }

  async findOne(
    id: string,
    currentUser: { role: string; phcId?: string; id: string },
  ) {
    const screening = await this.prisma.screening.findUnique({
      where: { id },
      include: {
        patient: true,
        asha: true,
        phc: true,
      },
    });

    if (!screening) {
      throw new NotFoundException('Screening record not found');
    }

    // Role restriction check
    if (
      currentUser.role === 'DOCTOR' &&
      screening.phcId !== currentUser.phcId
    ) {
      throw new ForbiddenException(
        'You do not have access to screenings outside your PHC center',
      );
    }

    if (currentUser.role === 'ASHA' && screening.ashaId !== currentUser.id) {
      throw new ForbiddenException(
        'You do not have access to this screening record',
      );
    }

    return this.formatScreening(screening, currentUser.role);
  }

  async create(createScreeningDto: CreateScreeningDto) {
    const {
      patientId,
      ashaId,
      phcId,
      bpSystolic,
      bpDiastolic,
      sugar,
      familyHistory,
      lowActivity,
      tobaccoUse,
      symptoms,
      riskLevel,
      riskReasons,
      consentGiven,
    } = createScreeningDto;

    // Verify patient, asha, phc exist
    const patientExists = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patientExists) {
      throw new NotFoundException('Patient not found');
    }

    const ashaExists = await this.prisma.user.findUnique({
      where: { id: ashaId, role: 'ASHA' },
    });
    if (!ashaExists) {
      throw new NotFoundException('ASHA worker not found');
    }

    const phcExists = await this.prisma.pHC.findUnique({
      where: { id: phcId },
    });
    if (!phcExists) {
      throw new NotFoundException('PHC not found');
    }

    const screening = await this.prisma.screening.create({
      data: {
        patientId,
        ashaId,
        phcId,
        bpSystolic,
        bpDiastolic,
        sugar,
        familyHistory: familyHistory || false,
        lowActivity: lowActivity || false,
        tobaccoUse: tobaccoUse || false,
        symptoms: symptoms || null,
        riskLevel,
        riskReasons: JSON.stringify(riskReasons),
        consentGiven: consentGiven !== undefined ? consentGiven : true,
        status: 'NEW',
      },
      include: {
        patient: true,
        asha: true,
        phc: true,
      },
    });

    return this.formatScreening(screening, 'DOCTOR'); // assuming creator has full view
  }

  async update(
    id: string,
    updateDto: any,
    currentUser: { role: string; phcId?: string; name: string },
  ) {
    const screening = await this.prisma.screening.findUnique({
      where: { id },
    });

    if (!screening) {
      throw new NotFoundException('Screening record not found');
    }

    // Only doctors belonging to the screening's PHC can modify screenings
    if (
      currentUser.role === 'DOCTOR' &&
      screening.phcId !== currentUser.phcId
    ) {
      throw new ForbiddenException(
        'You do not have permission to modify screenings outside your PHC center',
      );
    }

    const data: any = {};

    if (updateDto.status !== undefined) {
      data.status = updateDto.status;
      if (updateDto.status === 'RESOLVED') {
        if (!screening.diagnosis && !updateDto.diagnosis) {
          throw new BadRequestException(
            'Diagnosis is required to resolve a screening',
          );
        }
        data.resolvedAt = new Date();
        data.resolvedBy = currentUser.name;
      }
    }
    if (updateDto.doctorNotes !== undefined) {
      data.doctorNotes = updateDto.doctorNotes;
    }
    if (updateDto.diagnosis !== undefined) {
      data.diagnosis = updateDto.diagnosis;
    }
    if (updateDto.prescription !== undefined) {
      data.prescription = updateDto.prescription;
    }

    const updated = await this.prisma.screening.update({
      where: { id },
      data,
      include: {
        patient: true,
        asha: true,
        phc: true,
      },
    });

    return this.formatScreening(updated, currentUser.role);
  }
}
