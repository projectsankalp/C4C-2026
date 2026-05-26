import { Option } from '@/types/onboarding';

export const REVENUE_RANGES: Option[] = [
  {
    label: 'No Revenue Yet',
    value: 'pre_revenue',
    description:
      'Business is still in idea stage or has not started earning yet.'
  },
  {
    label: '0 - 5 Lakhs',
    value: '0_5l',
    description:
      'Early-stage micro business with small-scale operations.'
  },
  {
    label: '5 - 50 Lakhs',
    value: '5_50l',
    description:
      'Growing business with stable customers and increasing operations.'
  },
  {
    label: '50 Lakhs - 5 Crores',
    value: '50l_5cr',
    description:
      'Established small enterprise with expansion potential.'
  },
  {
    label: '5 Crores+',
    value: '5cr_plus',
    description:
      'Medium-scale enterprise with advanced growth and scaling needs.'
  }
];