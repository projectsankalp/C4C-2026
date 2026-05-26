export interface User {
  id: string;
  phone: string;
  wellnessProfile: {
    baselineScore: number;
    lastActive: Date;
  };
}

export interface CheckIn {
  id: string;
  userId: string;
  timestamp: Date;
  score: number;
  notes?: string;
}

export interface HealthAggregate {
  userId: string;
  period: string; // e.g., 'daily', 'weekly'
  averageScore: number;
  anomaliesDetected: boolean;
}

export interface IVRSignal {
  id: string;
  userId: string;
  timestamp: Date;
  extractedIndicators: string[];
  sentimentScore: number;
}

export interface DistressFlag {
  id: string;
  userId: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  resolved: boolean;
}

export interface Visit {
  id: string;
  userId: string;
  date: Date;
  type: 'gp' | 'asha_worker' | 'specialist';
  notes: string;
}
