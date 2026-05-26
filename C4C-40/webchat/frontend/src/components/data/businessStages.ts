import { Option } from '@/types/onboarding';

export const BUSINESS_STAGES: Option[] = [
  {
    label: 'Idea Stage',
    value: 'idea',
    description:
      'You have a business idea but have not started formal operations yet.',
    infoLink: 'https://www.startupindia.gov.in/'
  },
  {
    label: 'Existing Business (Unregistered)',
    value: 'existing',
    description:
      'You are already operating and earning revenue but do not yet have formal registrations.'
  },
  {
    label: 'Registered MSME',
    value: 'msme',
    description:
      'Your business is formally registered and eligible for many MSME schemes.',
    infoLink: 'https://udyamregistration.gov.in/'
  },
  {
    label: 'Self Help Group (SHG)',
    value: 'shg_business',
    description:
      'Business operated through or supported by a Self Help Group.'
  }
];