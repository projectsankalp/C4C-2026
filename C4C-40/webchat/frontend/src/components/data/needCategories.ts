import { Option } from '@/types/onboarding';

export const NEED_CATEGORIES: Option[] = [
  {
    label: 'Loan / Capital',
    value: 'loan',
    description:
      'Need funds for machinery, inventory, working capital, or expanding the business.',
    infoLink: 'https://www.jansamarth.in/'
  },
  {
    label: 'Business Registration',
    value: 'registration',
    description:
      'Need help registering GST, Udyam, trade licenses, or other business documents.'
  },
  {
    label: 'Government Subsidies',
    value: 'subsidy',
    description:
      'Looking for grants, subsidies, or financial assistance schemes.',
    infoLink: 'https://www.myscheme.gov.in/'
  },
  {
    label: 'Mentorship & Guidance',
    value: 'mentorship',
    description:
      'Need expert guidance, incubation support, networking, or business coaching.'
  },
  {
    label: 'Compliance Support',
    value: 'compliance',
    description:
      'Need help with tax filing, renewals, licenses, or legal compliance.'
  },
  {
    label: 'Market Access',
    value: 'market_access',
    description:
      'Need support finding customers, exhibitions, marketplaces, or online selling opportunities.'
  },
  {
    label: 'Digital Marketing',
    value: 'digital_marketing',
    description:
      'Need help promoting your business online using social media or advertisements.'
  },
  {
    label: 'Skill Training',
    value: 'training',
    description:
      'Looking for workshops, entrepreneurship programs, or technical training.'
  }
];