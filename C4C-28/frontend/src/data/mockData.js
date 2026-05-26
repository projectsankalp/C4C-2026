// Mock data for Swachh Vayu platform (Aligned to Khedgaon & Pimpalgaon only)

export const currentUser = {
  name: 'Rajesh Kumar',
  village: 'Khedgaon',
  district: 'Nashik',
  state: 'Maharashtra',
  language: 'हिंदी',
  role: 'citizen',
};

export const adminUser = {
  name: 'Priya Sharma',
  role: 'District Admin',
  district: 'Nashik',
  state: 'Maharashtra',
};

export const liveStats = {
  villagesMonitored: 2,
  activeNodes: 2,
  nationalAvgAQI: 89,
  languagesSupported: 6,
};

export const userDashboardStats = {
  currentAQI: 47,
  currentStatus: 'Good',
  predictedAQI: 91,
  predictedTrend: 'rising',
  villageRank: 1,
  totalVillages: 2,
  nearbyNodesActive: 2,
  nearbyNodesOffline: 0,
};

export const adminStats = {
  totalNodes: 2,
  newNodesThisWeek: 0,
  registeredCitizens: 124,
  todayAvgAQI: 89,
  alertsDispatched: 8,
};

export const aqiTrendData = [
  { time: '00:00', aqi: 45 },
  { time: '01:00', aqi: 48 },
  { time: '02:00', aqi: 52 },
  { time: '03:00', aqi: 49 },
  { time: '04:00', aqi: 47 },
  { time: '05:00', aqi: 43 },
  { time: '06:00', aqi: 45 },
  { time: '07:00', aqi: 55 },
  { time: '08:00', aqi: 72 },
  { time: '09:00', aqi: 85 },
  { time: '10:00', aqi: 91 },
  { time: '11:00', aqi: 88 },
  { time: '12:00', aqi: 80 },
  { time: '13:00', aqi: 75 },
  { time: '14:00', aqi: 70 },
  { time: '15:00', aqi: 68 },
  { time: '16:00', aqi: 65 },
  { time: '17:00', aqi: 72 },
  { time: '18:00', aqi: 85 },
  { time: '19:00', aqi: 91 },
  { time: '20:00', aqi: 89 },
  { time: '21:00', aqi: 78 },
  { time: '22:00', aqi: 60 },
  { time: '23:00', aqi: 50 },
];

export const aqiGuide = [
  { range: '0–50', label: 'Good', color: '#16A34A' },
  { range: '51–100', label: 'Satisfactory', color: '#65A30D' },
  { range: '101–200', label: 'Moderate', color: '#F59E0B' },
  { range: '201–300', label: 'Poor', color: '#EA580C' },
  { range: '301–400', label: 'Very Poor', color: '#DC2626' },
  { range: '401–500', label: 'Severe', color: '#7F1D1D' },
];

export const recentAlerts = [
  { id: 1, date: '25 May 2026', time: '11:45 AM', type: 'AQI Warning', message: 'AQI crossed 100 in Pimpalgaon zone', status: 'Active' },
  { id: 2, date: '25 May 2026', time: '08:30 AM', type: 'Sensor Offline', message: 'NODE_02 went offline temporarily', status: 'Resolved' },
  { id: 3, date: '24 May 2026', time: '06:15 PM', type: 'AQI Alert', message: 'Burning detected near Khedgaon fields', status: 'Resolved' },
  { id: 4, date: '24 May 2026', time: '02:00 PM', type: 'Prediction', message: 'AQI expected to rise in Pimpalgaon by evening', status: 'Resolved' },
];

export const nearbyNodes = [
  { id: 'NODE_01', location: 'Panchayat Office', status: 'Online', aqi: 47, battery: 95, lastUpdated: '1 min ago' },
  { id: 'NODE_02', location: 'Gram Panchayat', status: 'Online', aqi: 132, battery: 95, lastUpdated: 'Just now' },
];

export const sensorNodes = [
  { id: 'NODE_01', code: 'NODE_01', location: 'Panchayat Office', village: 'Khedgaon', lat: 18.5204, lng: 73.8567, status: 'Online', aqi: 47, battery: 95, signal: 95, lastSeen: '1 min ago', loraFreq: '433 MHz' },
  { id: 'NODE_02', code: 'NODE_02', location: 'Gram Panchayat', village: 'Pimpalgaon', lat: 20.012, lng: 73.811, status: 'Online', aqi: 132, battery: 95, signal: 88, lastSeen: 'Just now', loraFreq: '868 MHz' },
];

export const villageRankings = [
  { rank: 1, village: 'Khedgaon', district: 'Nashik', state: 'Maharashtra', avgAQI: 47, prevAQI: 55, change: 14.5, trend: 'improving', rewardStatus: 'Eligible' },
  { rank: 2, village: 'Pimpalgaon', district: 'Nashik', state: 'Maharashtra', avgAQI: 132, prevAQI: 140, change: 5.7, trend: 'improving', rewardStatus: 'Eligible' },
];

export const recentDispatches = [
  { id: 1, village: 'Khedgaon', message: 'AQI Alert: Normal', channel: 'SMS', time: '11:45 AM', status: 'Delivered' },
  { id: 2, village: 'Pimpalgaon', message: 'AQI Alert: Moderate', channel: 'SMS', time: '09:00 AM', status: 'Delivered' },
];

export const latestUpdates = [
  { id: 1, date: '25 May 2026', title: 'Swachh Vayu successfully deployed in Khedgaon and Pimpalgaon' },
  { id: 2, date: '24 May 2026', title: 'Q2 Rankings published — Khedgaon tops the clean air chart' },
  { id: 3, date: '22 May 2026', title: 'Firmware update v2.4 successfully loaded on NODE_01 and NODE_02' },
  { id: 4, date: '20 May 2026', title: 'Advisory guidelines updated for crop drying and spraying actions' },
];

export const statesList = [
  'Maharashtra',
];

export const languagesList = [
  'English', 'हिंदी (Hindi)', 'मराठी (Marathi)', 'தமிழ் (Tamil)',
  'తెలుగు (Telugu)', 'ಕನ್ನಡ (Kannada)',
];

export const heatmapData = [
  { village: 'Khedgaon', mon: 45, tue: 42, wed: 48, thu: 40, fri: 38, sat: 44, sun: 42 },
  { village: 'Pimpalgaon', mon: 132, tue: 128, wed: 140, thu: 135, fri: 130, sat: 125, sun: 138 },
];
