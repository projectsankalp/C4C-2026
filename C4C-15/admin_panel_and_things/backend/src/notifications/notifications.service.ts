import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(currentUser: {
    id: string;
    role: string;
    phcId?: string;
  }) {
    const notifications = [];

    if (currentUser.role === 'DOCTOR') {
      if (!currentUser.phcId) return [];

      const redCount = await this.prisma.screening.count({
        where: {
          phcId: currentUser.phcId,
          riskLevel: 'RED',
          status: { in: ['NEW', 'FOLLOW_UP'] },
        },
      });

      if (redCount > 0) {
        notifications.push({
          id: `doc_red_${Date.now()}`,
          title: `${redCount} RED patients pending review`,
          message: `${redCount} high-risk screenings awaiting review.`,
          type: 'CLINICAL_ALERT',
          severity: 'CRITICAL',
          targetType: 'SCREENING',
          targetId: null,
          action: 'OPEN_TRIAGE',
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      const followupCount = await this.prisma.screening.count({
        where: {
          phcId: currentUser.phcId,
          status: 'FOLLOW_UP',
        },
      });

      if (followupCount > 0) {
        notifications.push({
          id: `doc_fup_${Date.now()}`,
          title: `${followupCount} follow-ups pending`,
          message: `${followupCount} patients require follow-up.`,
          type: 'CLINICAL_ALERT',
          severity: 'HIGH',
          targetType: 'SCREENING',
          targetId: null,
          action: 'OPEN_FOLLOWUPS',
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      const recentScreenings = await this.prisma.screening.count({
        where: {
          phcId: currentUser.phcId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (recentScreenings > 0) {
        notifications.push({
          id: `doc_new_${Date.now()}`,
          title: `New ASHA screenings received`,
          message: `${recentScreenings} new screenings received in the last 24h.`,
          type: 'OPERATIONAL',
          severity: 'INFO',
          targetType: 'SCREENING',
          targetId: null,
          action: 'OPEN_TRIAGE',
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    }

    if (currentUser.role === 'ADMIN') {
      const redBacklog = await this.prisma.screening.count({
        where: {
          riskLevel: 'RED',
          status: { in: ['NEW', 'FOLLOW_UP'] },
        },
      });

      if (redBacklog >= 5) {
        notifications.push({
          id: `adm_heatmap_${Date.now()}`,
          title: `High burden detected`,
          message: `Multiple villages have increased RED burden.`,
          type: 'OPERATIONAL_ALERT',
          severity: 'HIGH',
          targetType: 'VILLAGE',
          targetId: null,
          action: 'OPEN_HEATMAP',
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      if (redBacklog > 0) {
        notifications.push({
          id: `adm_red_${Date.now()}`,
          title: `${redBacklog} unresolved RED backlog`,
          message: `There are unresolved high-risk screenings in the district.`,
          type: 'OPERATIONAL_ALERT',
          severity: 'CRITICAL',
          targetType: 'SCREENING',
          targetId: null,
          action: 'OPEN_SCREENINGS',
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      const restrictedCount = await this.prisma.user.count({
        where: { status: 'RESTRICTED' },
      });

      if (restrictedCount > 0) {
        notifications.push({
          id: `adm_restrict_${Date.now()}`,
          title: `${restrictedCount} personnel accounts restricted`,
          message: `${restrictedCount} network accounts are currently restricted.`,
          type: 'SECURITY_ALERT',
          severity: 'HIGH',
          targetType: 'USER',
          targetId: null,
          action: 'OPEN_PERSONNEL',
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    }

    return notifications;
  }
}
