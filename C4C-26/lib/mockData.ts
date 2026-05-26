import { UserProfile } from './scoreEngine';

export const defaultProfile: UserProfile = {
  householdSize: 4,
  landAcres: 50,
  cropType: 'moderate',
  irrigationFrequency: 'bi-weekly',
  livestockCount: 10,
};

export interface UsageDataPoint {
  month: string;
  usage: number;
  benchmark: number;
}

export const monthlyUsageData: UsageDataPoint[] = [
  { month: 'Jan', usage: 12000, benchmark: 14000 },
  { month: 'Feb', usage: 11500, benchmark: 13800 },
  { month: 'Mar', usage: 14000, benchmark: 15000 },
  { month: 'Apr', usage: 18500, benchmark: 17500 },
  { month: 'May', usage: 22000, benchmark: 20000 },
  { month: 'Jun', usage: 25000, benchmark: 21000 },
  { month: 'Jul', usage: 24000, benchmark: 20500 },
  { month: 'Aug', usage: 21000, benchmark: 19500 },
  { month: 'Sep', usage: 17000, benchmark: 17000 },
  { month: 'Oct', usage: 14500, benchmark: 15500 },
  { month: 'Nov', usage: 13000, benchmark: 14500 },
  { month: 'Dec', usage: 12500, benchmark: 14000 },
];

export interface CropOption {
  value: UserProfile['cropType'];
  label: string;
  description: string;
  waterFactor: string;
}

export const cropOptions: CropOption[] = [
  {
    value: 'none',
    label: 'No Agriculture / Fallow',
    description: 'No crops are currently grown on the property.',
    waterFactor: 'Zero extraction'
  },
  {
    value: 'drought-resistant',
    label: 'Drought-Resistant Crops',
    description: 'Millet, sorghum, pulses, or indigenous local varieties.',
    waterFactor: 'Very Low extraction'
  },
  {
    value: 'moderate',
    label: 'Moderate Water Crops',
    description: 'Wheat, barley, mustard, or seasonal vegetables.',
    waterFactor: 'Medium extraction'
  },
  {
    value: 'water-intensive',
    label: 'Water-Intensive Crops',
    description: 'Rice paddy, sugarcane, cotton, or banana crops.',
    waterFactor: 'Extremely High extraction'
  }
];

export interface IrrigationOption {
  value: UserProfile['irrigationFrequency'];
  label: string;
  description: string;
  gallonsPerAcrePerDay: number;
}

export const irrigationOptions: IrrigationOption[] = [
  {
    value: 'none',
    label: 'No Active Irrigation',
    description: 'Purely rain-fed farming practices.',
    gallonsPerAcrePerDay: 0
  },
  {
    value: 'bi-weekly',
    label: 'Bi-Weekly Cycles',
    description: 'Irritated twice a week using targeted drip systems.',
    gallonsPerAcrePerDay: 8
  },
  {
    value: 'weekly',
    label: 'Weekly Cycles',
    description: 'Irritated once a week using overhead sprinklers.',
    gallonsPerAcrePerDay: 5
  },
  {
    value: 'daily',
    label: 'Daily Scheduled Watering',
    description: 'Regular daily sprinkler/micro-sprinkler system.',
    gallonsPerAcrePerDay: 20
  },
  {
    value: 'flood',
    label: 'Traditional Flood Irrigation',
    description: 'Channels flooding the fields; high runoff and evaporation.',
    gallonsPerAcrePerDay: 60
  }
];

export interface RecommendationTip {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  category: 'household' | 'irrigation' | 'crops' | 'livestock' | 'general';
  icon: string;
  savingsGallons: number;
}

export const recommendationsTips: RecommendationTip[] = [
  {
    id: 'tip-1',
    title: 'Switch to Sub-Surface Drip Irrigation',
    description: 'Replace traditional flood irrigation channels with sub-surface drip tubing. Delivers water directly to roots, eliminating evaporation loss.',
    impact: 'High',
    category: 'irrigation',
    icon: 'Droplet',
    savingsGallons: 45000
  },
  {
    id: 'tip-2',
    title: 'Transition Fields to Pearl Millet & Sorghum',
    description: 'Transition 50% of water-intensive cash crops to drought-hardy millets. These require up to 70% less water and build soil organic matter.',
    impact: 'High',
    category: 'crops',
    icon: 'Sprout',
    savingsGallons: 38000
  },
  {
    id: 'tip-3',
    title: 'Install Rooftop Rainwater Harvesting',
    description: 'Set up collection pipes from roofs into dedicated filtration pits to recharge the local water table directly.',
    impact: 'Medium',
    category: 'general',
    icon: 'CloudRain',
    savingsGallons: 12000
  },
  {
    id: 'tip-4',
    title: 'Deploy Soil Moisture Sensors',
    description: 'Install smart iot soil probes to irrigate only when root moisture drops below 40% capacity, cutting unnecessary schedules.',
    impact: 'Medium',
    category: 'irrigation',
    icon: 'Cpu',
    savingsGallons: 18000
  },
  {
    id: 'tip-5',
    title: 'Recycle Livestock Washwater',
    description: 'Filter wash and cleaning water through a sand/gravel reedbed to reuse for barn cleaning and dust suppression.',
    impact: 'Medium',
    category: 'livestock',
    icon: 'RefreshCw',
    savingsGallons: 9500
  },
  {
    id: 'tip-6',
    title: 'Convert Household Fixtures to Aerators',
    description: 'Install standard 1.5 gpm kitchen and bathroom tap aerators. Instantly cuts base household consumption with no pressure loss.',
    impact: 'Low',
    category: 'household',
    icon: 'Home',
    savingsGallons: 3000
  },
  {
    id: 'tip-7',
    title: 'Establish Bioswales along Slopes',
    description: 'Carve natural vegetative contours to capture rainfall runoffs. Slows water flow, encouraging 4x higher aquifer absorption rate.',
    impact: 'High',
    category: 'general',
    icon: 'Compass',
    savingsGallons: 25000
  },
  {
    id: 'tip-8',
    title: 'Implement Rotational Grazing Paddocks',
    description: 'Subdivide grazing pastures to prevent soil compaction. Looser soil structure doubles natural rainwater infiltration rates.',
    impact: 'Low',
    category: 'livestock',
    icon: 'Layers',
    savingsGallons: 5000
  }
];
