export const mockPatients = [
  {
    id: 'P-1042',
    name: 'Suresh Kumar',
    age: 45,
    village: 'Kalladka',
    vitals: { bp: '168/102', sugar: 238 },
    risk: 'high',
    riskReasons: ['Hypertensive Crisis', 'Elevated Blood Sugar'],
    ashaWorker: 'ASHA Meena',
    status: 'pending',
    phc: 'Bantwal PHC',
    symptoms: ['Dizziness', 'Chest Pain'],
    doctorNotes: ''
  },
  {
    id: 'P-1043',
    name: 'Shobha Naik',
    age: 62,
    village: 'Vitla',
    vitals: { bp: '145/90', sugar: 180 },
    risk: 'medium',
    riskReasons: ['Borderline Hypertension'],
    ashaWorker: 'ASHA Geetha',
    status: 'pending',
    phc: 'Vittal PHC',
    symptoms: ['Fatigue'],
    doctorNotes: ''
  },
  {
    id: 'P-1044',
    name: 'Ramesh Singh',
    age: 28,
    village: 'Panemangalore',
    vitals: { bp: '120/80', sugar: 95 },
    risk: 'low',
    riskReasons: ['None'],
    ashaWorker: 'ASHA Kavitha',
    status: 'resolved',
    phc: 'Bantwal PHC',
    symptoms: ['Mild Fever', 'Cough'],
    doctorNotes: 'Prescribed paracetamol. Routine follow-up scheduled.'
  },
  {
    id: 'P-1045',
    name: 'Kamla Devi',
    age: 55,
    village: 'Kalladka',
    vitals: { bp: '180/110', sugar: 310 },
    risk: 'high',
    riskReasons: ['Severe Hypertension', 'Uncontrolled Diabetes'],
    ashaWorker: 'ASHA Meena',
    status: 'pending',
    phc: 'Bantwal PHC',
    symptoms: ['Blurred Vision', 'Headache'],
    doctorNotes: ''
  }
];

export const mockSystemStats = {
  totalScreened: 1248,
  highRisk: 12,
  mediumRisk: 45,
  lowRisk: 1191,
  pendingFollowUps: 28,
  resolvedCases: 1150
};

export const mockAdminStats = {
  totalUsers: 342,
  ashaWorkers: 210,
  doctors: 45,
  phcs: 12,
  totalScreenings: 45281,
  systemStatus: 'Operational'
};

export const mockUsers = [
  { id: 'U-001', name: 'Dr. Rao', role: 'Doctor', village: '-', phc: 'Bantwal PHC', status: 'Active', lastActive: '2 mins ago' },
  { id: 'U-002', name: 'ASHA Meena', role: 'ASHA', village: 'Kalladka', phc: 'Bantwal PHC', status: 'Active', lastActive: '1 hr ago' },
  { id: 'U-003', name: 'ASHA Geetha', role: 'ASHA', village: 'Vitla', phc: 'Vittal PHC', status: 'Inactive', lastActive: '2 days ago' },
  { id: 'U-004', name: 'Admin Officer', role: 'Admin', village: '-', phc: 'District HQ', status: 'Active', lastActive: 'Just now' }
];
