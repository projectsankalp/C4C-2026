import { OnboardingStep } from '@/types/onboarding';

import { STATES } from './states';
import { LANGUAGES } from './languages';
import { BUSINESS_STAGES } from './businessStages';
import { BUSINESS_CATEGORIES } from './businessCategories';
import { REVENUE_RANGES } from './revenueRanges';
import { NEED_CATEGORIES } from './needCategories';
import { REGISTRATIONS } from './registrations';

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    field: 'fullName',
    type: 'text',
    question:
      'Welcome! What is your full name?'
  },

  {
    field: 'mobileNumber',
    type: 'phone',
    question:
      'What is your mobile number so we can save your profile?'
  },

  {
    field: 'preferredLanguage',
    type: 'select',
    question:
      'Which language would you prefer for communication?',
    options: LANGUAGES
  },

  {
    field: 'state',
    type: 'select',
    question:
      'Which state or union territory is your business based in?',
    options: STATES
  },

  {
    field: 'businessStage',
    type: 'select',
    question:
      'What stage is your business currently in?',
    options: BUSINESS_STAGES
  },

  {
    field: 'businessCategory',
    type: 'select',
    question:
      'What best describes your business?',
    options: BUSINESS_CATEGORIES
  },

  {
    field: 'annualRevenue',
    type: 'select',
    question:
      'What is your approximate annual revenue?',
    options: REVENUE_RANGES
  },

  {
    field: 'needCategory',
    type: 'multi-select',
    question:
      'What kind of support are you looking for right now?',
    options: NEED_CATEGORIES
  },

  {
    field: 'existingRegistrations',
    type: 'multi-select',
    question:
      'Which registrations or memberships do you already have?',
    options: REGISTRATIONS
  }
];

export default ONBOARDING_STEPS;