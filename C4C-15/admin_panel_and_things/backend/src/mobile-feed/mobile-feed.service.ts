import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type LiveScreeningRow = {
  patient_id: string;
  full_name: string;
  address: string;
  dob: string;
  mobile: string;
  patient_created_at: Date;
  screening_id: string;
  submitted_by: string | null;
  age: number;
  bmi: number;
  family_history: number;
  exercise: number;
  sugary_food: number;
  smoking: number;
  thirst: number;
  headaches: number;
  sleep: number;
  stress: number;
  answers: unknown;
  diabetes_risk: string;
  diabetes_probability: number;
  hypertension_risk: string;
  hypertension_probability: number;
  overall_risk: string;
  overall_probability: number;
  explainability: unknown;
  risk_reasons: unknown;
  screening_status: string;
  screening_created_at: Date;
  doctor_notes: string | null;
  diagnosis: string | null;
  prescription: string | null;
  resolved_at: Date | null;
  resolved_by: string | null;
};

const VALID_STATUSES = ['NEW', 'PENDING', 'FOLLOW_UP', 'RESOLVED'];

@Injectable()
export class MobileFeedService {
  constructor(private readonly prisma: PrismaService) {}

  private parseAddress(address: string) {
    const lines = String(address || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const houseNumber = lines[0]?.split(',')[0]?.trim() || '—';
    const village = lines[1]?.split(',')[0]?.trim() || 'Unassigned';

    return { houseNumber, village };
  }

  private calculateAge(dob: string) {
    const match = /^([0-3]?\d)-([0-1]?\d)-(\d{4})$/.exec(String(dob || ''));
    if (!match) return '—';

    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    const birthDate = new Date(year, month, day);
    if (Number.isNaN(birthDate.getTime())) return '—';

    const diff = Date.now() - birthDate.getTime();
    return Math.max(0, Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
  }

  private normalizeRisk(value: string | null) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'high' || normalized === 'red') return 'RED';
    if (normalized === 'moderate' || normalized === 'medium' || normalized === 'yellow') return 'YELLOW';
    return 'GREEN';
  }

  private normalizeStatus(value: string | null) {
    const normalized = String(value || '').trim().toUpperCase();
    if (normalized === 'RESOLVED' || normalized === 'COMPLETED') return 'RESOLVED';
    if (normalized === 'FOLLOW_UP' || normalized === 'PROCESSING') return 'FOLLOW_UP';
    if (normalized === 'PENDING') return 'PENDING';
    return 'NEW';
  }

  private parseJsonArray(value: unknown) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  private parseJsonObject(value: unknown) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
      } catch {
        return {};
      }
    }

    return {};
  }

  private formatFieldLabel(field: string) {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  async getDoctorWorkspaceFeed() {
    const screenings = await this.prisma.$queryRaw<LiveScreeningRow[]>`
      SELECT
        p.id AS patient_id,
        p.full_name,
        p.address,
        p.dob,
        p.mobile,
        p.created_at AS patient_created_at,
        s.id AS screening_id,
        s.submitted_by,
        s.age,
        s.bmi,
        s.family_history,
        s.exercise,
        s.sugary_food,
        s.smoking,
        s.thirst,
        s.headaches,
        s.sleep,
        s.stress,
        s.answers,
        s.diabetes_risk,
        s.diabetes_probability,
        s.hypertension_risk,
        s.hypertension_probability,
        s.overall_risk,
        s.overall_probability,
        s.explainability,
        s.risk_reasons,
        s.status AS screening_status,
        s.created_at AS screening_created_at,
        s.doctor_notes,
        s.diagnosis,
        s.prescription,
        s.resolved_at,
        s.resolved_by
      FROM public.screenings s
      JOIN public.patients p ON p.id = s.patient_id
      ORDER BY s.created_at DESC
    `;

    const livePatients = screenings.map((row) => {
      const { houseNumber, village } = this.parseAddress(row.address);
      const status = this.normalizeStatus(row.screening_status);
      const riskLevel = this.normalizeRisk(row.overall_risk);
      const answers = this.parseJsonObject(row.answers);
      const explainability = this.parseJsonObject(row.explainability);
      const riskReasons = this.parseJsonArray(row.risk_reasons);

      const surveySummary = [
        `Age: ${row.age}`,
        `BMI: ${Number(row.bmi).toFixed(1)}`,
        `Family history: ${row.family_history}`,
        `Exercise: ${row.exercise}`,
        `Sugary food: ${row.sugary_food}`,
        `Smoking: ${row.smoking}`,
        `Thirst: ${row.thirst}`,
        `Headaches: ${row.headaches}`,
        `Sleep: ${row.sleep}`,
        `Stress: ${row.stress}`,
      ];

      const surveyAnswers = Object.entries(answers).map(([key, value]) => `${this.formatFieldLabel(key)}: ${String(value)}`);

      return {
        id: row.screening_id,
        patientId: row.patient_id,
        name: row.full_name || 'Unknown Patient',
        age: row.age || this.calculateAge(row.dob),
        gender: '—',
        village,
        houseNumber,
        phone: row.mobile || '',
        address: row.address || '',
        bp: `BMI ${Number(row.bmi).toFixed(1)}`,
        sugar: `Overall ${row.overall_risk} (${row.overall_probability}%)`,
        riskLevel,
        status,
        ashaName: row.submitted_by || 'Mobile ASHA',
        phcName: 'Mobile Intake',
        createdAt: row.patient_created_at,
        updatedAt: row.screening_created_at || row.patient_created_at,
        doctorNotes: row.doctor_notes || '',
        diagnosis: row.diagnosis || '',
        prescription: row.prescription || '',
        resolvedAt: row.resolved_at || (status === 'RESOLVED' ? row.screening_created_at : null),
        resolvedBy: row.resolved_by || (status === 'RESOLVED' ? 'Doctor Workspace' : null),
        latestSurvey: {
          age: row.age,
          bmi: Number(row.bmi),
          family_history: row.family_history,
          exercise: row.exercise,
          sugary_food: row.sugary_food,
          smoking: row.smoking,
          thirst: row.thirst,
          headaches: row.headaches,
          sleep: row.sleep,
          stress: row.stress,
          answers,
          surveySummary,
          explainability,
          riskReasons,
          overallRisk: row.overall_risk,
          overallProbability: row.overall_probability,
          diabetesRisk: row.diabetes_risk,
          diabetesProbability: row.diabetes_probability,
          hypertensionRisk: row.hypertension_risk,
          hypertensionProbability: row.hypertension_probability,
          submittedBy: row.submitted_by || 'Mobile ASHA',
          submittedAt: row.screening_created_at,
        },
        surveyAnswers,
        riskReasons,
        latestVisit: row.screening_id
          ? {
              id: row.screening_id,
              scheduledTime: `BMI ${Number(row.bmi).toFixed(1)}`,
              status: row.screening_status,
              riskLevel: row.overall_risk,
              visitDate: row.screening_created_at,
            }
          : null,
      };
    });

    const totalPatients = livePatients.length;
    const highRisk = livePatients.filter((patient) => patient.riskLevel === 'RED').length;
    const followUpsPending = livePatients.filter((patient) => patient.status === 'FOLLOW_UP').length;
    const resolvedCases = livePatients.filter((patient) => patient.status === 'RESOLVED').length;
    const todayScreeningsResult = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM public.screenings
      WHERE created_at::date = CURRENT_DATE
    `;
    const todaySyncs = Number(todayScreeningsResult[0]?.count || 0n);

    return {
      patients: livePatients,
      doctorStats: {
        totalScreened: totalPatients,
        highRisk,
        followUpsPending,
        resolvedCases,
        todaySyncs,
      },
      lastSyncedAt: new Date().toISOString(),
    };
  }

  async updateScreeningStatus(id: string, status: string) {
    const normalizedStatus = String(status || '').trim().toUpperCase();
    if (!VALID_STATUSES.includes(normalizedStatus)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const params: unknown[] = [normalizedStatus];
    let setClauses = 'status = $1, updated_at = NOW()';

    if (normalizedStatus === 'RESOLVED') {
      setClauses += ', resolved_at = NOW()';
    }

    params.push(id);
    await this.prisma.$executeRawUnsafe(
      `UPDATE public.screenings SET ${setClauses} WHERE id = $${params.length}`,
      ...params,
    );
  }

  async updateScreeningClinical(
    id: string,
    data: {
      doctorNotes?: string;
      diagnosis?: string;
      prescription?: string;
      status?: string;
      resolvedBy?: string;
    },
  ) {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    if (data.doctorNotes !== undefined) {
      params.push(data.doctorNotes);
      setClauses.push(`doctor_notes = $${params.length}`);
    }
    if (data.diagnosis !== undefined) {
      params.push(data.diagnosis);
      setClauses.push(`diagnosis = $${params.length}`);
    }
    if (data.prescription !== undefined) {
      params.push(data.prescription);
      setClauses.push(`prescription = $${params.length}`);
    }
    if (data.status !== undefined) {
      const normalizedStatus = String(data.status).trim().toUpperCase();
      params.push(normalizedStatus);
      setClauses.push(`status = $${params.length}`);
      if (normalizedStatus === 'RESOLVED') {
        setClauses.push('resolved_at = NOW()');
        const resolvedBy = data.resolvedBy || 'Doctor';
        params.push(resolvedBy);
        setClauses.push(`resolved_by = $${params.length}`);
      }
    }

    if (setClauses.length === 0) return;

    setClauses.push('updated_at = NOW()');
    params.push(id);

    await this.prisma.$executeRawUnsafe(
      `UPDATE public.screenings SET ${setClauses.join(', ')} WHERE id = $${params.length}`,
      ...params,
    );
  }
}