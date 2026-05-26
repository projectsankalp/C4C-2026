import { Option } from '@/types/onboarding';

export const REGISTRATIONS: Option[] = [
  {
    label: 'Udyam (MSME)',
    value: 'udyam',
    description:
      'Official MSME registration required for many government schemes and MSME benefits.',
    infoLink: 'https://udyamregistration.gov.in/'
  },
  {
    label: 'GST Registration',
    value: 'gst',
    description:
      'Required for many businesses involved in inter-state trade or above turnover limits.',
    infoLink: 'https://www.gst.gov.in/'
  },
  {
    label: 'FSSAI License',
    value: 'fssai',
    description:
      'Mandatory registration or license for food-related businesses.',
    infoLink: 'https://foscos.fssai.gov.in/'
  },
  {
    label: 'SHG Membership',
    value: 'shg',
    description:
      'Membership in a Self Help Group that may provide access to women-focused microfinance schemes.'
  },
  {
    label: 'Startup India Recognition',
    value: 'startup_india',
    description:
      'Recognition under Startup India for eligible innovation-led startups.',
    infoLink: 'https://www.startupindia.gov.in/'
  },
  {
    label: 'Trade License',
    value: 'trade_license',
    description:
      'Municipal trade license required for certain local businesses and shops.'
  },
  {
    label: 'None',
    value: 'none',
    description:
      'I currently do not have any formal registrations or memberships.'
  }
];