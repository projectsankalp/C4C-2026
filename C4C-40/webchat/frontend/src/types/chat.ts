export type Role = 'ai' | 'user';

export interface Option {
  label: string;
  value: string;
  description?: string;
  infoLink?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  options?: Option[];
  field?: string; 
  requiresUpload?: boolean;
}

export interface UserProfile {
  fullName?: string;
  mobileNumber?: string;
  state?: string;
  preferredLanguage?: string;
  businessStage?: string;
  businessCategory?: string;
  annualRevenue?: string;
  needCategory?: string | string[];
  existingRegistrations?: string | string[];
}