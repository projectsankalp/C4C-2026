/**
 * GraamSehat ASHA Worker App - English Locale
 * Path: /src/locales/en.js
 * Contains all English UI text mappings.
 */

export const en = {
  appName: "GraamSehat ASHA App",
  welcome: "Welcome",
  goodMorning: "Good morning",
  goodAfternoon: "Good afternoon",
  goodEvening: "Good evening",
  online: "Online",
  offline: "Offline",
  syncStatus: "Sync Status",
  syncing: "Syncing data...",
  pendingSyncCount: "{count} records pending upload",
  syncSuccess: "{count} records uploaded successfully!",
  
  // Home Screen Buttons
  btnScanCard: "SCAN CARD",
  descScanCard: "Screen a patient",
  btnMyPatients: "MY PATIENTS",
  descMyPatients: "View your patients",
  btnMedicineLog: "MEDICINE LOG",
  descMedicineLog: "Record medicine",
  
  // Stats
  screenedToday: "Screened today",
  pendingSync: "Pending sync",
  highRisk: "High risk",
  
  // Scan Card Options
  scanTitle: "Scan Patient Card",
  nfcTitle: "Option 1: NFC Tap",
  nfcDesc: "Tap the patient's health card to the back of your phone",
  nfcNotSupported: "NFC not available on this device, use QR instead",
  qrTitle: "Option 2: QR Code",
  qrDesc: "Scan the QR code on the patient's card using the camera",
  manualTitle: "Option 3: Manual ID",
  manualDesc: "Enter the 6-digit Health ID manually",
  noCardOption: "Patient doesn't have a card",
  noCardBtn: "Register New Patient",
  manualPlaceholder: "Enter 6 digits",
  btnSubmit: "Submit",
  invalidUid: "Invalid UID or Luhn checksum failed. Please try again.",
  
  // Registration Wizard
  regTitle: "New Patient Registration",
  regStepPhoto: "Patient Photo",
  regStepDetails: "Personal Details",
  regStepLocation: "Location",
  regStepContact: "Contact Info",
  regStepAadhaar: "Aadhaar Verification",
  regStepConfirm: "Confirmation",
  
  btnNext: "Next",
  btnBack: "Back",
  btnSkip: "Skip Photo",
  btnTakePhoto: "Take Photo",
  btnRetake: "Retake Photo",
  btnRegister: "Register Patient",
  btnEdit: "Edit",
  
  labelName: "Full Name",
  labelAge: "Age (in years)",
  labelGender: "Gender",
  labelBloodGroup: "Blood Group",
  labelVillage: "Village Name",
  labelDistrict: "District",
  labelHousehold: "Household Number",
  labelPrimaryPhone: "Primary Phone Number",
  labelAltPhone: "Alternate Phone (Optional)",
  labelLinkFamily: "Link to Family Account?",
  labelFamilyPhone: "Primary Family Phone",
  labelAadhaar: "Aadhaar Number (12 digits)",
  aadhaarNotice: "Aadhaar is stored encrypted and used only for identity verification.",
  noAadhaarOpt: "Patient does not have Aadhaar",
  
  regSuccess: "Patient Registered successfully!",
  healthIdLabel: "Health ID Generated:",
  btnPrintShare: "Share via WhatsApp",
  btnGoHome: "Go to Home",
  btnStartScreening: "Start Screening",
  
  // Screening Wizard
  screenTitle: "Health Screening",
  screenStep: "Step {current} of {total}",
  
  qAgeTitle: "How old is the patient?",
  optAge1: "Under 35 years",
  optAge2: "35 to 49 years",
  optAge3: "50 years or older",
  
  qWaistTitle: "What is the waist measurement?",
  qGenderFirst: "Please select gender first",
  optWaistMen1: "Under 80 cm",
  optWaistMen2: "80 to 89 cm",
  optWaistMen3: "90 cm or more",
  optWaistWomen1: "Under 75 cm",
  optWaistWomen2: "75 to 84 cm",
  optWaistWomen3: "85 cm or more",
  
  qActivityTitle: "How active is the patient daily?",
  optActivity1: "Very active (Farms/walks a lot)",
  optActivity2: "Somewhat active (Some walking)",
  optActivity3: "Not active (Mostly sitting)",
  
  qFamilyTitle: "Does anyone in the family have diabetes?",
  optFamily1: "No family history",
  optFamily2: "One parent has diabetes",
  optFamily3: "Both parents have diabetes",
  
  qBpTitle: "Enter blood pressure reading",
  labelBpSys: "Upper Number (Systolic)",
  labelBpDia: "Lower Number (Diastolic)",
  bpNotAvailable: "Reading not available (No BP Monitor)",
  bpLivePrefix: "Classification: ",
  
  qGlucoseTitle: "Enter blood glucose reading (mg/dL)",
  glucoseNotAvailable: "Reading not available",
  glucoseLivePrefix: "Classification: ",
  
  qSymptomsTitle: "Does the patient have any of these? (Select all)",
  optSymp1: "Frequent thirst",
  optSymp2: "Blurry vision",
  optSymp3: "Numbness in feet",
  optSymp4: "Frequent urination",
  optSymp5: "Unexplained tiredness",
  optSympNone: "None of the above",
  
  // Results
  resultTitle: "Screening Results",
  riskLow: "LOW RISK",
  riskMod: "MODERATE RISK",
  riskHigh: "HIGH RISK — REFER NOW",
  patientName: "Patient Name",
  idrsScore: "IDRS Score",
  bpReading: "BP Reading",
  doctorsNote: "Doctor's Advice Note",
  btnShareWhatsApp: "Share via WhatsApp",
  btnSaveContinue: "Save and Continue",
  btnNewScreening: "New Screening",
  
  // Medicine Log
  medTitle: "Record Medicine Distribution",
  selectPatient: "Select Patient",
  patientSelected: "Patient: {name} ({uid})",
  searchPatientPlaceholder: "Search patient by name or UID...",
  selectMed: "Select Medicine",
  labelQty: "Quantity Distributed",
  btnLogMed: "Log Medicine",
  medSuccess: "Medicine logged successfully!",
  stockWarning: "Low stock: {name} — only {qty} left. Request from PHC.",
  stockOk: "Stock updated. Left: {qty} units.",
  
  // My Patients Page
  patientsTitle: "My Patients Directory",
  searchPlaceholder: "Search by name or UID...",
  sortBy: "Sort by",
  filterBy: "Filter by Risk",
  allRisks: "All Risks",
  sortLastScreened: "Last Screened",
  sortRisk: "Risk Level",
  sortName: "Alphabetical",
  noPatientsFound: "No patients found matching criteria.",
  lastScreenedLabel: "Last Screened: ",
  neverScreened: "Never",
  
  // Patient Profile
  profileTitle: "Patient Profile",
  riskBadge: "Risk: {risk}",
  gridReadings: "Latest Readings Grid",
  timeline: "Screening History (Last 3)",
  btnUpdateScreening: "Update Screening",
  btnFullHistory: "View Full History",
  btnMedHistory: "Medicine Log History",
  btnEditPatient: "Edit Patient Info",
  
  // General & Settings
  settings: "Settings",
  language: "Language",
  logout: "Logout",
  approvedStatus: "Approved ASHA Worker",
  pendingStatus: "Account Pending Approval. Contact Administrator.",
  mockOffline: "Mock Offline Mode",
  dbReset: "Reset Local Database",
  dbResetSuccess: "IndexedDB database cleared successfully."
};
