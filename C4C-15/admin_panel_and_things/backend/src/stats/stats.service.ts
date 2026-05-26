import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDoctorStats(currentUser: {
    id: string;
    role: string;
    phcId?: string;
  }) {
    if (currentUser.role !== 'DOCTOR') {
      throw new ForbiddenException('Only doctors can access doctor stats');
    }

    if (!currentUser.phcId) {
      return {
        totalScreened: 0,
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        pendingFollowups: 0,
        resolvedCases: 0,
      };
    }

    const [
      totalScreened,
      highRisk,
      mediumRisk,
      lowRisk,
      pendingFollowups,
      resolvedCases,
    ] = await Promise.all([
      this.prisma.screening.count({ where: { phcId: currentUser.phcId } }),
      this.prisma.screening.count({
        where: { phcId: currentUser.phcId, riskLevel: 'RED' },
      }),
      this.prisma.screening.count({
        where: { phcId: currentUser.phcId, riskLevel: 'YELLOW' },
      }),
      this.prisma.screening.count({
        where: { phcId: currentUser.phcId, riskLevel: 'GREEN' },
      }),
      this.prisma.screening.count({
        where: { phcId: currentUser.phcId, status: 'FOLLOW_UP' },
      }),
      this.prisma.screening.count({
        where: { phcId: currentUser.phcId, status: 'RESOLVED' },
      }),
    ]);

    return {
      totalScreened,
      highRisk,
      mediumRisk,
      lowRisk,
      pendingFollowups,
      resolvedCases,
    };
  }

  async getAdminStats() {
    const [
      totalUsers,
      ashaWorkers,
      doctors,
      admins,
      totalPHCs,
      totalScreenings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ASHA' } }),
      this.prisma.user.count({ where: { role: 'DOCTOR' } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.pHC.count(),
      this.prisma.screening.count(),
    ]);

    return {
      totalUsers,
      ashaWorkers,
      doctors,
      admins,
      totalPHCs,
      totalScreenings,
    };
  }

  async getSystemStats() {
    const [activeUsers, criticalPatients] = await Promise.all([
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.screening.count({
        where: { riskLevel: 'RED', status: { not: 'RESOLVED' } },
      }),
    ]);

    return {
      activeUsers,
      pendingUploads: 0, // stable static default for community sync queue
      criticalPatients,
      systemStatus: 'ONLINE',
      apiStatus: 'HEALTHY',
    };
  }

  async getVillageRiskHeatmap() {
    const screenings = await this.prisma.screening.findMany({
      include: {
        patient: {
          select: { village: true },
        },
      },
    });

    const villageMap = new Map<string, any>();

    for (const s of screenings) {
      const village = s.patient?.village || 'Unknown';
      if (!villageMap.has(village)) {
        villageMap.set(village, {
          village,
          totalScreenings: 0,
          redCount: 0,
          yellowCount: 0,
          greenCount: 0,
          riskScore: 0,
          burdenLevel: 'Low Burden',
          recommendedAction: 'Routine monitoring',
        });
      }

      const stats = villageMap.get(village);
      stats.totalScreenings += 1;

      if (s.riskLevel === 'RED') {
        stats.redCount += 1;
      } else if (s.riskLevel === 'YELLOW') {
        stats.yellowCount += 1;
      } else if (s.riskLevel === 'GREEN') {
        stats.greenCount += 1;
      }
    }

    const result = Array.from(villageMap.values()).map((stats) => {
      stats.riskScore = stats.redCount * 3 + stats.yellowCount;

      if (stats.riskScore >= 20) {
        stats.burdenLevel = 'Critical Burden';
        stats.recommendedAction = 'Deploy emergency medical camp immediately';
      } else if (stats.riskScore >= 10) {
        stats.burdenLevel = 'High Burden';
        stats.recommendedAction = 'Schedule PHC camp';
      } else if (stats.riskScore >= 5) {
        stats.burdenLevel = 'Moderate Burden';
        stats.recommendedAction = 'Increase ASHA surveillance';
      } else {
        stats.burdenLevel = 'Low Burden';
        stats.recommendedAction = 'Routine monitoring';
      }

      return stats;
    });

    return result.sort((a, b) => b.riskScore - a.riskScore);
  }
}
