import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowupDto } from './dto/create-followup.dto';
import { UpdateFollowupStatusDto } from './dto/update-followup-status.dto';

@Injectable()
export class FollowupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUser: { role: string; id: string }) {
    const where: any = {};

    if (currentUser.role === 'DOCTOR') {
      where.doctorId = currentUser.id;
    } else if (currentUser.role === 'ASHA') {
      where.assignedToAshaId = currentUser.id;
    }

    return this.prisma.followUp.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
            village: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedToAsha: {
          select: {
            id: true,
            name: true,
          },
        },
        screening: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    screeningId: string,
    createFollowupDto: CreateFollowupDto,
    currentUser: { id: string; role: string; phcId?: string },
  ) {
    // Only doctor can create followups
    if (currentUser.role !== 'DOCTOR') {
      throw new ForbiddenException('Only doctors can create follow-ups');
    }

    const screening = await this.prisma.screening.findUnique({
      where: { id: screeningId },
    });

    if (!screening) {
      throw new NotFoundException('Screening record not found');
    }

    // Verify screening belongs to the doctor's PHC
    if (screening.phcId !== currentUser.phcId) {
      throw new ForbiddenException(
        'You cannot create a follow-up for a patient from another PHC center',
      );
    }

    const assignedAshaId =
      createFollowupDto.assignedToAshaId || screening.ashaId;

    // Verify assigned ASHA exists
    const asha = await this.prisma.user.findUnique({
      where: { id: assignedAshaId, role: 'ASHA' },
    });

    if (!asha) {
      throw new NotFoundException('Assigned ASHA worker not found');
    }

    // Create the FollowUp
    const followup = await this.prisma.followUp.create({
      data: {
        screeningId: screening.id,
        patientId: screening.patientId,
        assignedToAshaId: assignedAshaId,
        doctorId: currentUser.id,
        note: createFollowupDto.note || 'Follow-up requested by PHC doctor.',
        status: 'PENDING',
      },
      include: {
        patient: true,
        doctor: true,
        assignedToAsha: true,
        screening: true,
      },
    });

    // Update the screening status to FOLLOW_UP
    await this.prisma.screening.update({
      where: { id: screening.id },
      data: { status: 'FOLLOW_UP' },
    });

    return followup;
  }

  async updateStatus(
    id: string,
    updateFollowupStatusDto: UpdateFollowupStatusDto,
    currentUser: { role: string; id: string },
  ) {
    const followup = await this.prisma.followUp.findUnique({
      where: { id },
    });

    if (!followup) {
      throw new NotFoundException('Follow-up record not found');
    }

    // Only assigned ASHA or ADMIN can update follow-up status
    if (
      currentUser.role === 'ASHA' &&
      followup.assignedToAshaId !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to modify this follow-up',
      );
    }

    if (currentUser.role === 'DOCTOR') {
      throw new ForbiddenException('Doctors cannot modify follow-up statuses');
    }

    return this.prisma.followUp.update({
      where: { id },
      data: { status: updateFollowupStatusDto.status },
      include: {
        patient: true,
        doctor: true,
        assignedToAsha: true,
      },
    });
  }
}
