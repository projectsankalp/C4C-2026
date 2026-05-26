export interface IndiaRegion {
  id: string;
  name: string;
  state: string;
  coordinates: { x: number; y: number }; // SVG coordinate space (viewBox 0 0 800 900)
  lat: number;
  lng: number;
  stressLevel: 'critical' | 'high' | 'moderate' | 'low' | 'safe';
  groundwaterDepth: number;        // meters
  extractionRate: number;          // million litres/day
  rechargeRate: number;            // million litres/day
  rainfallMM: number;              // annual mm
  aquiferHealth: number;           // 0-100
  sustainabilityScore: number;     // 0-100
  population: number;
  primaryUsage: 'agriculture' | 'industrial' | 'mixed' | 'domestic';
  aiRecommendation: string;
  trend: 'improving' | 'stable' | 'declining' | 'critical';
}

export interface RainfallVsExtraction {
  month: string;
  rainfall: number;
  extraction: number;
  recharge: number;
}

export interface GroundwaterTrend {
  year: number;
  depth: number;
  stressIndex: number;
  rechargeCapacity: number;
}

export interface PredictionPoint {
  year: number;
  currentTrajectory: number;     // groundwater depth if no change
  optimizedTrajectory: number;   // with conservation measures
  criticalThreshold: number;     // fixed danger line
}

export interface EnvironmentalAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  region: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string; // lucide icon name
}

export interface AnalysisInput {
  location: string;
  intendedUsage: 'agriculture' | 'domestic' | 'industrial';
  borewellDepth: number;
  extractionFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  landSize: number;
}

export interface AnalysisResult {
  sustainabilityScore: number;
  extractionRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  lifespanEstimateYears: number;
  nearbyBetterZones: string[];
  conservationSuggestions: string[];
  monthlyImpactLitres: number;
  aquiferHealthImpact: number;
}

export interface AIRecommendation {
  id: string;
  category: 'irrigation' | 'recharge' | 'policy' | 'technology' | 'community';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  savingsLitresPerYear: number;
  implementationEase: 'Easy' | 'Moderate' | 'Complex';
  icon: string;
}

// 25 realistic Indian districts across different zones
export const indiaRegions: IndiaRegion[] = [
  {
    id: 'pun-asr',
    name: 'Amritsar',
    state: 'Punjab',
    coordinates: { x: 260, y: 220 },
    lat: 31.6340,
    lng: 74.8723,
    stressLevel: 'critical',
    groundwaterDepth: 45.2,
    extractionRate: 450,
    rechargeRate: 150,
    rainfallMM: 650,
    aquiferHealth: 18,
    sustainabilityScore: 22,
    population: 2500000,
    primaryUsage: 'agriculture',
    aiRecommendation: 'Transition 40% of cultivation area to short-duration paddy varieties and deploy extensive drip irrigation networks.',
    trend: 'critical',
  },
  {
    id: 'raj-jai',
    name: 'Jaipur',
    state: 'Rajasthan',
    coordinates: { x: 270, y: 350 },
    lat: 26.9124,
    lng: 75.7873,
    stressLevel: 'critical',
    groundwaterDepth: 62.8,
    extractionRate: 380,
    rechargeRate: 80,
    rainfallMM: 520,
    aquiferHealth: 12,
    sustainabilityScore: 15,
    population: 3100000,
    primaryUsage: 'mixed',
    aiRecommendation: 'Enforce mandatory urban rooftop rainwater harvesting and institute smart metering on institutional deep borewells.',
    trend: 'declining',
  },
  {
    id: 'raj-jai-jod',
    name: 'Jodhpur',
    state: 'Rajasthan',
    coordinates: { x: 190, y: 360 },
    lat: 26.2389,
    lng: 73.0243,
    stressLevel: 'critical',
    groundwaterDepth: 75.4,
    extractionRate: 290,
    rechargeRate: 40,
    rainfallMM: 360,
    aquiferHealth: 8,
    sustainabilityScore: 10,
    population: 1500000,
    primaryUsage: 'domestic',
    aiRecommendation: 'Establish community micro-watershed recharge shafts and scale up traditional stepwell (Baori) rejuvenation projects.',
    trend: 'critical',
  },
  {
    id: 'guj-ahm',
    name: 'Ahmedabad',
    state: 'Gujarat',
    coordinates: { x: 200, y: 480 },
    lat: 23.0225,
    lng: 72.5714,
    stressLevel: 'high',
    groundwaterDepth: 38.5,
    extractionRate: 410,
    rechargeRate: 220,
    rainfallMM: 780,
    aquiferHealth: 35,
    sustainabilityScore: 42,
    population: 5600000,
    primaryUsage: 'industrial',
    aiRecommendation: 'Deploy decentralized zero-liquid-discharge (ZLD) systems across industrial parks to mandate 100% industrial water recycling.',
    trend: 'declining',
  },
  {
    id: 'guj-kut',
    name: 'Kutch',
    state: 'Gujarat',
    coordinates: { x: 120, y: 460 },
    lat: 23.7337,
    lng: 69.8597,
    stressLevel: 'high',
    groundwaterDepth: 55.1,
    extractionRate: 180,
    rechargeRate: 90,
    rainfallMM: 410,
    aquiferHealth: 28,
    sustainabilityScore: 33,
    population: 2100000,
    primaryUsage: 'agriculture',
    aiRecommendation: 'Promote sub-surface drip irrigation and saline aquifer monitoring networks to prevent coastal saline intrusion.',
    trend: 'stable',
  },
  {
    id: 'mah-pun',
    name: 'Pune',
    state: 'Maharashtra',
    coordinates: { x: 260, y: 640 },
    lat: 18.5204,
    lng: 73.8567,
    stressLevel: 'moderate',
    groundwaterDepth: 22.4,
    extractionRate: 340,
    rechargeRate: 290,
    rainfallMM: 1100,
    aquiferHealth: 58,
    sustainabilityScore: 61,
    population: 6200000,
    primaryUsage: 'mixed',
    aiRecommendation: 'Develop injection wells in low-lying suburban basalt structures to boost post-monsoon aquifer percolation rates.',
    trend: 'stable',
  },
  {
    id: 'mah-nag',
    name: 'Nagpur',
    state: 'Maharashtra',
    coordinates: { x: 410, y: 550 },
    lat: 21.1458,
    lng: 79.0882,
    stressLevel: 'moderate',
    groundwaterDepth: 28.1,
    extractionRate: 210,
    rechargeRate: 180,
    rainfallMM: 1050,
    aquiferHealth: 48,
    sustainabilityScore: 50,
    population: 2900000,
    primaryUsage: 'agriculture',
    aiRecommendation: 'Implement farm pond schemes (Shet tale) on clayey soils and expand continuous contour trenching in hilly catchment belts.',
    trend: 'declining',
  },
  {
    id: 'kar-blr',
    name: 'Bengaluru',
    state: 'Karnataka',
    coordinates: { x: 340, y: 760 },
    lat: 12.9716,
    lng: 77.5946,
    stressLevel: 'critical',
    groundwaterDepth: 58.6,
    extractionRate: 580,
    rechargeRate: 190,
    rainfallMM: 980,
    aquiferHealth: 20,
    sustainabilityScore: 25,
    population: 8400000,
    primaryUsage: 'domestic',
    aiRecommendation: 'Enforce localized wastewater replenishment in community borewells and restore urban wetland drainage corridors.',
    trend: 'declining',
  },
  {
    id: 'kar-bel',
    name: 'Belagavi',
    state: 'Karnataka',
    coordinates: { x: 280, y: 720 },
    lat: 15.8497,
    lng: 74.4977,
    stressLevel: 'low',
    groundwaterDepth: 18.2,
    extractionRate: 160,
    rechargeRate: 210,
    rainfallMM: 1200,
    aquiferHealth: 72,
    sustainabilityScore: 78,
    population: 1800000,
    primaryUsage: 'agriculture',
    aiRecommendation: 'Incentivize organic mulching techniques to preserve soil moisture profiles and restrict deep horizontal drilling.',
    trend: 'improving',
  },
  {
    id: 'ker-way',
    name: 'Wayanad',
    state: 'Kerala',
    coordinates: { x: 310, y: 810 },
    lat: 11.6854,
    lng: 76.1320,
    stressLevel: 'safe',
    groundwaterDepth: 8.5,
    extractionRate: 65,
    rechargeRate: 140,
    rainfallMM: 2600,
    aquiferHealth: 92,
    sustainabilityScore: 94,
    population: 810000,
    primaryUsage: 'domestic',
    aiRecommendation: 'Support spring-shed rejuvenation and vegetative contouring on slopes to maintain naturally high water-table structures.',
    trend: 'improving',
  },
  {
    id: 'ker-pal',
    name: 'Palakkad',
    state: 'Kerala',
    coordinates: { x: 330, y: 840 },
    lat: 10.7867,
    lng: 76.6548,
    stressLevel: 'low',
    groundwaterDepth: 14.1,
    extractionRate: 110,
    rechargeRate: 180,
    rainfallMM: 1900,
    aquiferHealth: 80,
    sustainabilityScore: 84,
    population: 2800000,
    primaryUsage: 'agriculture',
    aiRecommendation: 'Install check dams across small streams to optimize lateral groundwater seepage during dry seasons.',
    trend: 'stable',
  },
  {
    id: 'tam-che',
    name: 'Chennai',
    state: 'Tamil Nadu',
    coordinates: { x: 410, y: 780 },
    lat: 13.0827,
    lng: 80.2707,
    stressLevel: 'critical',
    groundwaterDepth: 42.1,
    extractionRate: 390,
    rechargeRate: 110,
    rainfallMM: 1400,
    aquiferHealth: 22,
    sustainabilityScore: 28,
    population: 7100000,
    primaryUsage: 'domestic',
    aiRecommendation: 'Expand coast-parallel shallow aquifer recharge trenches and scale up smart desalinization integration.',
    trend: 'stable',
  },
  {
    id: 'tam-cbi',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    coordinates: { x: 360, y: 820 },
    lat: 11.0168,
    lng: 76.9558,
    stressLevel: 'high',
    groundwaterDepth: 49.3,
    extractionRate: 240,
    rechargeRate: 120,
    rainfallMM: 700,
    aquiferHealth: 38,
    sustainabilityScore: 40,
    population: 3400000,
    primaryUsage: 'industrial',
    aiRecommendation: 'Establish localized artificial recharge wells inside manufacturing hubs and implement real-time water quality sensors.',
    trend: 'declining',
  },
  {
    id: 'tel-hyd',
    name: 'Hyderabad',
    state: 'Telangana',
    coordinates: { x: 390, y: 650 },
    lat: 17.3850,
    lng: 78.4867,
    stressLevel: 'high',
    groundwaterDepth: 35.8,
    extractionRate: 360,
    rechargeRate: 190,
    rainfallMM: 820,
    aquiferHealth: 40,
    sustainabilityScore: 45,
    population: 6800000,
    primaryUsage: 'mixed',
    aiRecommendation: 'Enforce geo-tagged borewell registration and accelerate smart water recycling in urban cooling utilities.',
    trend: 'declining',
  },
  {
    id: 'ap-vis',
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    coordinates: { x: 480, y: 620 },
    lat: 17.6868,
    lng: 83.2185,
    stressLevel: 'moderate',
    groundwaterDepth: 20.3,
    extractionRate: 190,
    rechargeRate: 210,
    rainfallMM: 1000,
    aquiferHealth: 64,
    sustainabilityScore: 66,
    population: 2000000,
    primaryUsage: 'industrial',
    aiRecommendation: 'Create specialized sand dams along coastal rivers to recharge sandy coastal aquifers and block seawater intrusion.',
    trend: 'stable',
  },
  {
    id: 'ori-bhu',
    name: 'Bhubaneswar',
    state: 'Odisha',
    coordinates: { x: 550, y: 540 },
    lat: 20.2961,
    lng: 85.8245,
    stressLevel: 'low',
    groundwaterDepth: 12.6,
    extractionRate: 120,
    rechargeRate: 240,
    rainfallMM: 1450,
    aquiferHealth: 82,
    sustainabilityScore: 85,
    population: 1200000,
    primaryUsage: 'domestic',
    aiRecommendation: 'Implement bioswales along key municipal expressways to capitalize on high monsoon volumes for aquifer replenishment.',
    trend: 'improving',
  },
  {
    id: 'wb-kol',
    name: 'Kolkata',
    state: 'West Bengal',
    coordinates: { x: 630, y: 490 },
    lat: 22.5726,
    lng: 88.3639,
    stressLevel: 'moderate',
    groundwaterDepth: 16.4,
    extractionRate: 310,
    rechargeRate: 280,
    rainfallMM: 1600,
    aquiferHealth: 60,
    sustainabilityScore: 63,
    population: 4500000,
    primaryUsage: 'domestic',
    aiRecommendation: 'Remediate urban pond networks to prevent deep alluvial aquifer subsidence and monitor heavy metal levels.',
    trend: 'stable',
  },
  {
    id: 'up-lko',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    coordinates: { x: 420, y: 360 },
    lat: 26.8467,
    lng: 80.9462,
    stressLevel: 'high',
    groundwaterDepth: 31.2,
    extractionRate: 390,
    rechargeRate: 220,
    rainfallMM: 880,
    aquiferHealth: 42,
    sustainabilityScore: 46,
    population: 3400000,
    primaryUsage: 'mixed',
    aiRecommendation: 'Establish large-scale bio-retention cells in public parks and enforce heavy regulatory pricing on industrial extractions.',
    trend: 'declining',
  },
  {
    id: 'up-var',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    coordinates: { x: 490, y: 390 },
    lat: 25.3176,
    lng: 82.9739,
    stressLevel: 'moderate',
    groundwaterDepth: 24.5,
    extractionRate: 230,
    rechargeRate: 210,
    rainfallMM: 950,
    aquiferHealth: 54,
    sustainabilityScore: 56,
    population: 1400000,
    primaryUsage: 'mixed',
    aiRecommendation: 'Rejuvenate historical network tanks to bolster surface-to-groundwater connectivity along the Ganges plains.',
    trend: 'stable',
  },
  {
    id: 'bih-pat',
    name: 'Patna',
    state: 'Bihar',
    coordinates: { x: 550, y: 390 },
    lat: 25.5941,
    lng: 85.1376,
    stressLevel: 'moderate',
    groundwaterDepth: 18.6,
    extractionRate: 280,
    rechargeRate: 290,
    rainfallMM: 1100,
    aquiferHealth: 66,
    sustainabilityScore: 68,
    population: 2200000,
    primaryUsage: 'agriculture',
    aiRecommendation: 'Optimize community canal percolation and expand shallow horizontal aquifer recharge schemes.',
    trend: 'stable',
  },
  {
    id: 'mp-bho',
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    coordinates: { x: 370, y: 460 },
    lat: 23.2599,
    lng: 77.4126,
    stressLevel: 'moderate',
    groundwaterDepth: 26.3,
    extractionRate: 240,
    rechargeRate: 230,
    rainfallMM: 1050,
    aquiferHealth: 52,
    sustainabilityScore: 55,
    population: 1900000,
    primaryUsage: 'mixed',
    aiRecommendation: 'Initiate integrated sub-surface check dams along local black cotton soil valleys to lock sub-surface flow.',
    trend: 'stable',
  },
  {
    id: 'mp-ind',
    name: 'Indore',
    state: 'Madhya Pradesh',
    coordinates: { x: 320, y: 480 },
    lat: 22.7196,
    lng: 75.8577,
    stressLevel: 'high',
    groundwaterDepth: 34.7,
    extractionRate: 280,
    rechargeRate: 180,
    rainfallMM: 920,
    aquiferHealth: 38,
    sustainabilityScore: 41,
    population: 2200000,
    primaryUsage: 'industrial',
    aiRecommendation: 'Standardize rainwater harvesting in manufacturing zones and strictly monitor recharge-to-extraction ratios.',
    trend: 'declining',
  },
  {
    id: 'har-gur',
    name: 'Gurugram',
    state: 'Haryana',
    coordinates: { x: 310, y: 310 },
    lat: 28.4595,
    lng: 77.0266,
    stressLevel: 'critical',
    groundwaterDepth: 56.4,
    extractionRate: 390,
    rechargeRate: 110,
    rainfallMM: 580,
    aquiferHealth: 21,
    sustainabilityScore: 24,
    population: 1600000,
    primaryUsage: 'industrial',
    aiRecommendation: 'Impose severe fines on unregistered domestic deep borewells and enforce 100% recycling in IT parks.',
    trend: 'critical',
  },
  {
    id: 'ass-gua',
    name: 'Guwahati',
    state: 'Assam',
    coordinates: { x: 710, y: 360 },
    lat: 26.1445,
    lng: 91.7362,
    stressLevel: 'safe',
    groundwaterDepth: 6.2,
    extractionRate: 90,
    rechargeRate: 240,
    rainfallMM: 1800,
    aquiferHealth: 94,
    sustainabilityScore: 96,
    population: 1100000,
    primaryUsage: 'domestic',
    aiRecommendation: 'Establish green filter strips near wetlands to naturally filter superficial runoff entering pristine alluvial aquifers.',
    trend: 'improving',
  },
  {
    id: 'meg-shi',
    name: 'Shillong',
    state: 'Meghalaya',
    coordinates: { x: 730, y: 390 },
    lat: 25.5788,
    lng: 91.8831,
    stressLevel: 'safe',
    groundwaterDepth: 5.1,
    extractionRate: 40,
    rechargeRate: 190,
    rainfallMM: 2900,
    aquiferHealth: 97,
    sustainabilityScore: 98,
    population: 350000,
    primaryUsage: 'domestic',
    aiRecommendation: 'Promote traditional bamboo drip irrigation networks and secure steep high-percolation karst aquifers.',
    trend: 'improving',
  }
];

// 12 monthly objects showing realistic monsoon patterns
export const rainfallVsExtraction: RainfallVsExtraction[] = [
  { month: 'Jan', rainfall: 15, extraction: 320, recharge: 40 },
  { month: 'Feb', rainfall: 18, extraction: 340, recharge: 45 },
  { month: 'Mar', rainfall: 22, extraction: 390, recharge: 50 },
  { month: 'Apr', rainfall: 35, extraction: 440, recharge: 60 },
  { month: 'May', rainfall: 50, extraction: 480, recharge: 70 },
  { month: 'Jun', rainfall: 150, extraction: 420, recharge: 180 },
  { month: 'Jul', rainfall: 380, extraction: 250, recharge: 410 },
  { month: 'Aug', rainfall: 350, extraction: 220, recharge: 390 },
  { month: 'Sep', rainfall: 240, extraction: 260, recharge: 290 },
  { month: 'Oct', rainfall: 80, extraction: 310, recharge: 120 },
  { month: 'Nov', rainfall: 25, extraction: 315, recharge: 55 },
  { month: 'Dec', rainfall: 12, extraction: 310, recharge: 40 }
];

// 10 yearly objects (2015-2024) showing declining trends
export const groundwaterTrend: GroundwaterTrend[] = [
  { year: 2015, depth: 22.4, stressIndex: 48, rechargeCapacity: 82 },
  { year: 2016, depth: 23.9, stressIndex: 51, rechargeCapacity: 80 },
  { year: 2017, depth: 25.1, stressIndex: 53, rechargeCapacity: 77 },
  { year: 2018, depth: 27.2, stressIndex: 57, rechargeCapacity: 73 },
  { year: 2019, depth: 28.9, stressIndex: 61, rechargeCapacity: 69 },
  { year: 2020, depth: 29.5, stressIndex: 62, rechargeCapacity: 68 },
  { year: 2021, depth: 31.4, stressIndex: 66, rechargeCapacity: 65 },
  { year: 2022, depth: 33.2, stressIndex: 69, rechargeCapacity: 61 },
  { year: 2023, depth: 35.8, stressIndex: 73, rechargeCapacity: 58 },
  { year: 2024, depth: 38.5, stressIndex: 77, rechargeCapacity: 54 }
];

// 15-year prediction trajectory (2024-2038)
export const predictionTrajectory: PredictionPoint[] = [
  { year: 2024, currentTrajectory: 38.5, optimizedTrajectory: 38.5, criticalThreshold: 65.0 },
  { year: 2025, currentTrajectory: 40.8, optimizedTrajectory: 39.2, criticalThreshold: 65.0 },
  { year: 2026, currentTrajectory: 43.1, optimizedTrajectory: 39.8, criticalThreshold: 65.0 },
  { year: 2027, currentTrajectory: 45.5, optimizedTrajectory: 40.3, criticalThreshold: 65.0 },
  { year: 2028, currentTrajectory: 48.0, optimizedTrajectory: 40.7, criticalThreshold: 65.0 },
  { year: 2029, currentTrajectory: 50.6, optimizedTrajectory: 41.1, criticalThreshold: 65.0 },
  { year: 2030, currentTrajectory: 53.3, optimizedTrajectory: 41.4, criticalThreshold: 65.0 },
  { year: 2031, currentTrajectory: 56.1, optimizedTrajectory: 41.7, criticalThreshold: 65.0 },
  { year: 2032, currentTrajectory: 59.0, optimizedTrajectory: 41.9, criticalThreshold: 65.0 },
  { year: 2033, currentTrajectory: 62.0, optimizedTrajectory: 42.1, criticalThreshold: 65.0 },
  { year: 2034, currentTrajectory: 65.2, optimizedTrajectory: 42.2, criticalThreshold: 65.0 }, // Crosses threshold
  { year: 2035, currentTrajectory: 68.5, optimizedTrajectory: 42.3, criticalThreshold: 65.0 },
  { year: 2036, currentTrajectory: 72.0, optimizedTrajectory: 42.4, criticalThreshold: 65.0 },
  { year: 2037, currentTrajectory: 75.7, optimizedTrajectory: 42.4, criticalThreshold: 65.0 },
  { year: 2038, currentTrajectory: 79.5, optimizedTrajectory: 42.5, criticalThreshold: 65.0 }
];

// 8 environmental alerts
export const environmentalAlerts: EnvironmentalAlert[] = [
  {
    id: 'alert-1',
    severity: 'critical',
    region: 'Jaipur, Rajasthan',
    title: 'Severe Water Table Contraction',
    description: 'Aquifer replenishment efficiency has fallen to historic lows (8%). Action needed to restrict luxury borewell usage.',
    timestamp: '2 hours ago',
    icon: 'AlertTriangle'
  },
  {
    id: 'alert-2',
    severity: 'critical',
    region: 'Amritsar, Punjab',
    title: 'Extreme Extraction Saturation',
    description: 'Water extraction rates are currently outstripping annual natural recharge rates by 300%. Crop pattern adjustments required.',
    timestamp: '4 hours ago',
    icon: 'TrendingUp'
  },
  {
    id: 'alert-3',
    severity: 'warning',
    region: 'Chennai, Tamil Nadu',
    title: 'Coastal Aquifer Salinization Threat',
    description: 'Borewells within 4km of coastlines show a 15% increase in total dissolved solids (TDS), signaling ocean salt-water leakage.',
    timestamp: '1 day ago',
    icon: 'Waves'
  },
  {
    id: 'alert-4',
    severity: 'warning',
    region: 'Bengaluru, Karnataka',
    title: 'Subsidence Risk Identified',
    description: 'Heavy cluster borewells in the eastern IT corridor report rapid silt deposits and shallow geological stress.',
    timestamp: '1 day ago',
    icon: 'ShieldAlert'
  },
  {
    id: 'alert-5',
    severity: 'info',
    region: 'Pune, Maharashtra',
    title: 'Successful Watershed Percolation',
    description: 'Suburban artificial injection trials report a +4m localized raise in aquifer water heights over a 3-month cycle.',
    timestamp: '2 days ago',
    icon: 'Droplet'
  },
  {
    id: 'alert-6',
    severity: 'warning',
    region: 'Indore, Madhya Pradesh',
    title: 'Industrial Runoff Threat',
    description: 'Chemical discharges detected in shallow sand strata. Unfiltered domestic utilization is strongly discouraged.',
    timestamp: '3 days ago',
    icon: 'AlertCircle'
  },
  {
    id: 'alert-7',
    severity: 'info',
    region: 'Wayanad, Kerala',
    title: 'Pristine Aquifer Equilibrium',
    description: 'Annual recharge indices maintain excellent heights. Micro-watershed preservation templates recommended nationally.',
    timestamp: '4 days ago',
    icon: 'CheckCircle'
  },
  {
    id: 'alert-8',
    severity: 'info',
    region: 'Shillong, Meghalaya',
    title: 'Bamboo Irrigation Success',
    description: 'Terraced agriculture sectors reporting 100% surface soil conservation, decreasing superficial groundwater runoff.',
    timestamp: '1 week ago',
    icon: 'Award'
  }
];

// AI recommendations
export const aiRecommendations: AIRecommendation[] = [
  {
    id: 'rec-1',
    category: 'irrigation',
    title: 'Sub-surface Drip Irrigation',
    description: 'Injects water directly into root zones, cutting evaporative water loss and optimizing plant absorption efficiency.',
    impact: 'High',
    savingsLitresPerYear: 1800000,
    implementationEase: 'Moderate',
    icon: 'Layers'
  },
  {
    id: 'rec-2',
    category: 'recharge',
    title: 'Rooftop Rainwater Harvesting Shafts',
    description: 'Channels rooftop rainfall runoff directly into deep sand-gravel filter cylinders to recharge dry domestic aquifers.',
    impact: 'High',
    savingsLitresPerYear: 350000,
    implementationEase: 'Easy',
    icon: 'CloudRain'
  },
  {
    id: 'rec-3',
    category: 'policy',
    title: 'Volumetric Block Tariffs',
    description: 'Applies scalable water usage pricing models that heavily penalize large-scale luxury or excessive extraction.',
    impact: 'Medium',
    savingsLitresPerYear: 950000,
    implementationEase: 'Complex',
    icon: 'Scale'
  },
  {
    id: 'rec-4',
    category: 'technology',
    title: 'IoT Aquifer Hydro-Sensors',
    description: 'Tracks sub-surface pressure changes in real-time, helping municipalities detect leaking borewell pipes instantly.',
    impact: 'Medium',
    savingsLitresPerYear: 500000,
    implementationEase: 'Moderate',
    icon: 'Cpu'
  },
  {
    id: 'rec-5',
    category: 'community',
    title: 'Water Panchayat Cooperatives',
    description: 'Enables democratic local management of community wells to coordinate seasonal extractions and crop types.',
    impact: 'High',
    savingsLitresPerYear: 1400000,
    implementationEase: 'Moderate',
    icon: 'Users'
  },
  {
    id: 'rec-6',
    category: 'irrigation',
    title: 'Laser Land Leveling',
    description: 'Ensures agricultural plots are completely flat, enabling equal water distribution and preventing standing pools.',
    impact: 'Medium',
    savingsLitresPerYear: 600000,
    implementationEase: 'Easy',
    icon: 'Maximize'
  },
  {
    id: 'rec-7',
    category: 'recharge',
    title: 'Recharge Shafts in Dry Ponds',
    description: 'Constructs filter bores at the bottom of standard village ponds to bypass tight clay structures.',
    impact: 'High',
    savingsLitresPerYear: 2200000,
    implementationEase: 'Complex',
    icon: 'ArrowDownCircle'
  },
  {
    id: 'rec-8',
    category: 'technology',
    title: 'Zero-Liquid Discharge Reclaim',
    description: 'Mandates closed-loop industrial water treatment systems that ensure zero toxic runoff and 100% recycling.',
    impact: 'High',
    savingsLitresPerYear: 4500000,
    implementationEase: 'Complex',
    icon: 'RefreshCw'
  },
  {
    id: 'rec-9',
    category: 'community',
    title: 'Local Stepwell Restoration',
    description: 'Cleans, deepens, and restores traditional stone stepwells to act as direct infiltration basins.',
    impact: 'Medium',
    savingsLitresPerYear: 400000,
    implementationEase: 'Easy',
    icon: 'History'
  },
  {
    id: 'rec-10',
    category: 'policy',
    title: 'Fallow Land Compensations',
    description: 'Provides direct subsidies to farming families that temporarily leave water-stressed tracts fallow.',
    impact: 'Medium',
    savingsLitresPerYear: 1200000,
    implementationEase: 'Complex',
    icon: 'DollarSign'
  }
];

// Weighted calculation algorithm
export function calculateAnalysis(input: AnalysisInput): AnalysisResult {
  // Base calculations
  let sustainabilityScore = 85;

  // 1. Borewell Depth Penalty
  // Ideal depth is less than 30m. Every meter beyond 30m incurs a penalty.
  if (input.borewellDepth > 30) {
    const excessiveDepth = input.borewellDepth - 30;
    sustainabilityScore -= excessiveDepth * 0.6;
  }

  // 2. Intended Usage Penalty
  let usageMultiplier = 1;
  if (input.intendedUsage === 'industrial') {
    sustainabilityScore -= 30;
    usageMultiplier = 2.5;
  } else if (input.intendedUsage === 'agriculture') {
    sustainabilityScore -= 15;
    usageMultiplier = 1.8;
  } else {
    sustainabilityScore -= 5;
    usageMultiplier = 0.9;
  }

  // 3. Extraction Frequency Penalty
  let frequencyMultiplier = 1;
  if (input.extractionFrequency === 'daily') {
    sustainabilityScore -= 20;
    frequencyMultiplier = 2.0;
  } else if (input.extractionFrequency === 'weekly') {
    sustainabilityScore -= 10;
    frequencyMultiplier = 1.2;
  } else if (input.extractionFrequency === 'bi-weekly') {
    sustainabilityScore -= 5;
    frequencyMultiplier = 0.8;
  } else {
    sustainabilityScore -= 2;
    frequencyMultiplier = 0.4;
  }

  // 4. Land Size Penalty/Benefit
  // In agriculture, larger land with high frequency is bad, but generally larger land allows better recharge
  const sizeFactor = Math.min(input.landSize / 10, 5);
  sustainabilityScore += sizeFactor * 2;

  // Clamp Score between 5 and 99
  sustainabilityScore = Math.max(5, Math.min(99, Math.round(sustainabilityScore)));

  // Risk Classification
  let extractionRisk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (sustainabilityScore < 30) {
    extractionRisk = 'Critical';
  } else if (sustainabilityScore < 50) {
    extractionRisk = 'High';
  } else if (sustainabilityScore < 70) {
    extractionRisk = 'Medium';
  }

  // Lifespan Projections (in years)
  // Higher scores, shallower depth, larger land sizes raise this.
  const baselineLife = 50;
  let lifespanEstimateYears = (sustainabilityScore / 100) * baselineLife + (input.landSize * 0.5);
  // Penalize heavily for deep borewells
  lifespanEstimateYears -= (input.borewellDepth / 10);
  lifespanEstimateYears = Math.max(3, Math.min(100, Math.round(lifespanEstimateYears)));

  // Volume Impact (in Litres per month)
  // Daily industrial: massive. Monthly domestic: small.
  const baseVolume = 15000; // liters
  const monthlyImpactLitres = Math.round(baseVolume * usageMultiplier * frequencyMultiplier * (input.landSize / 2 + 1));

  // Aquifer Health Impact (change in aquifer health percentage points over 5 years)
  const aquiferHealthImpact = Math.max(2, Math.min(85, Math.round((100 - sustainabilityScore) * 0.8)));

  // Find nearby districts with better scores as suggestions
  const suggestionsList = [
    'Deploy sub-surface drip irrigation loops immediately.',
    'Build a rooftop collection structure to feed your aquifer.',
    'Install volumetric metering to control weekly usage limits.',
    'Adopt organic compost layers to retain soil moisture profiles.',
    'Form a community water panchayat block to regulate common grids.'
  ];

  // Randomize a couple of suggestions depending on usage
  const conservationSuggestions: string[] = [];
  if (input.intendedUsage === 'agriculture') {
    conservationSuggestions.push(suggestionsList[0], suggestionsList[3], suggestionsList[4]);
  } else if (input.intendedUsage === 'industrial') {
    conservationSuggestions.push(suggestionsList[2], suggestionsList[0], suggestionsList[4]);
  } else {
    conservationSuggestions.push(suggestionsList[1], suggestionsList[2], suggestionsList[3]);
  }

  // Find better districts in the same zone or similar profile
  // For demo, list some high-performance districts
  const nearbyBetterZones = ['Wayanad (Kerala)', 'Shillong (Meghalaya)', 'Belagavi (Karnataka)'];

  return {
    sustainabilityScore,
    extractionRisk,
    lifespanEstimateYears,
    nearbyBetterZones,
    conservationSuggestions,
    monthlyImpactLitres,
    aquiferHealthImpact
  };
}
