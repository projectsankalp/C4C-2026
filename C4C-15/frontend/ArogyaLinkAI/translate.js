const fs = require('fs');

const fixScreen = (file, componentName, replacements) => {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes("import { useTranslation }")) {
    content = content.replace("import React", "import { useTranslation } from 'react-i18next';\nimport React");
  }

  if (!content.includes("const { t } = useTranslation()")) {
    const regex = new RegExp(`export default function ${componentName}\\(\\) \\{`);
    content = content.replace(regex, `export default function ${componentName}() {\n  const { t } = useTranslation();\n`);
  }

  for (const [search, replace] of replacements) {
    // If it's a string replace, just split and join.
    content = content.split(search).join(replace);
  }

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}

// 1. INDEX (Login)
fixScreen('app/index.tsx', 'LoginScreen', [
  ['setError(\\\'Please fill all fields\\\')', "setError(t('login.error_fill'))"],
  ['setError(data?.error || \\\'Invalid credentials\\\')', "setError(data?.error || t('login.error_cred'))"],
  ['setError(\\\'Unable to connect to the server\\\')', "setError(t('login.error_conn'))"],
  ['ASHA+', '{t("login.title")}'],
  ['Empowering rural healthcare', '{t("login.subtitle")}'],
  ['placeholder="Username"', 'placeholder={t("login.username")}'],
  ['placeholder="Password"', 'placeholder={t("login.password")}'],
  ['{showPassword\\n                    ? \\\'Hide\\\'\\n                    : \\\'Show\\\'}', '{showPassword ? t("login.hide") : t("login.show")}'],
  ['>\\n                  Login\\n                </Text>', '>\\n                  {t("login.btn")}\\n                </Text>'],
  ['Forgot Password?', '{t("login.forgot")}']
]);

// 2. DASHBOARD
fixScreen('app/dashboard.tsx', 'DashboardScreen', [
  ["setDisplayName('ASHA Worker')", "setDisplayName(t('dashboard.greeting'))"],
  [">\\n              Dashboard\\n            </Text>", ">\\n              {t('dashboard.dashboard')}\\n            </Text>"],
  ["New Patient", "{t('dashboard.new_patient')}"],
  ["Patient List", "{t('dashboard.patient_list')}"],
  ["Survey Forms", "{t('dashboard.survey_forms')}"],
  ["Visits", "{t('dashboard.visits')}"],
  ["Profile", "{t('dashboard.profile')}"],
  ["Sync Data", "{t('dashboard.sync')}"],
  ["Logout", "{t('dashboard.logout')}"],
  ["Health Summary", "{t('dashboard.health_summary')}"],
  ["Total Families", "{t('dashboard.total_families')}"],
  ["High Risk", "{t('dashboard.high_risk')}"],
  ["Quick Actions", "{t('dashboard.quick_actions')}"],
  ["Add Patient", "{t('dashboard.add_patient')}"],
  ["Start Survey", "{t('dashboard.start_survey')}"],
  ["View Records", "{t('dashboard.view_records')}"],
  ["Recent Activity", "{t('dashboard.recent_activity')}"],
  ["Added new family in Sector 4", "{t('dashboard.activity_1')}"],
  ["Completed ANC visit for Priya", "{t('dashboard.activity_2')}"]
]);

// 3. ADD PATIENT
fixScreen('app/add-patient.tsx', 'AddPatientScreen', [
  ["Alert.alert('Missing Details', 'Please fill name, date of birth and mobile');", "Alert.alert('Missing Details', t('add_patient.error_fill') || 'Please fill name, date of birth and mobile');"],
  ["Alert.alert('Invalid Number', 'Enter a valid 10-digit Indian mobile number');", "Alert.alert('Invalid Number', t('add_patient.error_mobile') || 'Enter a valid 10-digit Indian mobile number');"],
  ["Alert.alert('Error', data?.error || 'Failed to register patient');", "Alert.alert('Error', data?.error || t('add_patient.error_reg') || 'Failed to register patient');"],
  ["Alert.alert('Error', 'Unable to connect to server');", "Alert.alert('Error', t('add_patient.error_conn') || 'Unable to connect to server');"],
  [">\\n            Add Patient\\n          </Text>", ">\\n            {t('add_patient.title')}\\n          </Text>"],
  ["Full Name", "{t('add_patient.full_name')}"],
  ['placeholder="Enter patient name"', 'placeholder={t("add_patient.name_placeholder")}'],
  ["Address\\n          </Text>", "{t('add_patient.address')}\\n          </Text>"],
  ['placeholder="House No"', 'placeholder={t("add_patient.house_no")}'],
  ['placeholder="Street Name"', 'placeholder={t("add_patient.street_name")}'],
  ['placeholder="Village"', 'placeholder={t("add_patient.village")}'],
  ['placeholder="District"', 'placeholder={t("add_patient.district")}'],
  ['placeholder="State"', 'placeholder={t("add_patient.state")}'],
  ['placeholder="ZIP Code"', 'placeholder={t("add_patient.zip_code")}'],
  ['placeholder="Full Address Preview"', 'placeholder={t("add_patient.preview")}'],
  [">\\n            Gender\\n          </Text>", ">\\n            {t('add_patient.gender')}\\n          </Text>"],
  ["{['Male', 'Female', 'Other'].map(g => (", "{[{k: 'Male', v: t('add_patient.male')}, {k: 'Female', v: t('add_patient.female')}, {k: 'Other', v: t('add_patient.other')}].map(g => ("],
  ["gender === g &&", "gender === g.k &&"],
  ["setGender(g)", "setGender(g.k)"],
  ["{g}\\n                </Text>", "{g.v}\\n                </Text>"],
  [">\\n            Date of Birth\\n          </Text>", ">\\n            {t('add_patient.dob')}\\n          </Text>"],
  ['placeholder="DD-MM-YYYY"', 'placeholder={t("add_patient.dob_placeholder")}'],
  [">\\n            Mobile Number\\n          </Text>", ">\\n            {t('add_patient.mobile')}\\n          </Text>"],
  ['placeholder="Enter mobile number"', 'placeholder={t("add_patient.mobile_placeholder")}'],
  [">\\n                Generate Patient ID\\n              </Text>", ">\\n                {t('add_patient.generate_id')}\\n              </Text>"],
  ["Patient Health ID", "{t('add_patient.health_id')}"]
]);

// 4. PATIENT LIST
fixScreen('app/patient-list.tsx', 'PatientDetailsScreen', [
  [">\\n            Patient Details\\n          </Text>", ">\\n            {t('patient_list.title')}\\n          </Text>"],
  ['placeholder={`Search by ${filterType}`}', 'placeholder={t(`patient_list.search_${filterType}` as any) || `Search by ${filterType}`}'],
  ["{['name', 'village', 'risk'].map((type) => (", "{['name', 'village', 'risk'].map((type) => ("],
  ["{type.charAt(0).toUpperCase() + type.slice(1)}\\n                  </Text>", "{t(`patient_list.filter_${type}` as any)}\\n                  </Text>"],
  [">\\n              Loading saved patients...\\n            </Text>", ">\\n              {t('patient_list.loading')}\\n            </Text>"],
  [">\\n              No saved patients found.\\n            </Text>", ">\\n              {t('patient_list.no_patients')}\\n            </Text>"],
  ["{patient.address || 'No address saved'}", "{patient.address || t('patient_list.no_address')}"],
  [">\\n                  Show Card\\n                </Text>", ">\\n                  {t('patient_list.show_card')}\\n                </Text>"],
  [">\\n                  ASHA+\\n                </Text>", ">\\n                  {t('patient_list.card_title')}\\n                </Text>"],
  [">\\n                  Community Health Card\\n                </Text>", ">\\n                  {t('patient_list.card_subtitle')}\\n                </Text>"],
  [">\\n                  Name\\n                </Text>", ">\\n                  {t('patient_list.filter_name')}\\n                </Text>"],
  [">\\n                  Date of Birth\\n                </Text>", ">\\n                  {t('add_patient.dob')}\\n                </Text>"],
  [">\\n                  Address\\n                </Text>", ">\\n                  {t('add_patient.address')}\\n                </Text>"],
  ["{selectedPatient.address || 'No address saved'}", "{selectedPatient.address || t('patient_list.no_address')}"],
  [">\\n                  Mobile Number\\n                </Text>", ">\\n                  {t('add_patient.mobile')}\\n                </Text>"],
  [">\\n                  Health ID\\n                </Text>", ">\\n                  {t('add_patient.health_id')}\\n                </Text>"],
  [">\\n                  ASHA Worker Verified\\n                </Text>", ">\\n                  {t('patient_list.verified')}\\n                </Text>"],
  [">\\n                    Print Card\\n                  </Text>", ">\\n                    {t('patient_list.print_card')}\\n                  </Text>"]
]);

// 5. SURVEY
fixScreen('app/patient-survey.tsx', 'PatientSurveyScreen', [
  [">\\n            Health Survey\\n          </Text>", ">\\n            {t('survey.title')}\\n          </Text>"],
  [">\\n            Scan QR Code\\n          </Text>", ">\\n            {t('survey.scan_qr')}\\n          </Text>"],
  [">\\n            Patient Health ID\\n          </Text>", ">\\n            {t('survey.health_id')}\\n          </Text>"],
  ['placeholder="Enter 14-digit Health ID"', 'placeholder={t("survey.health_id_placeholder")}'],
  [">\\n            Scan Card\\n          </Text>", ">\\n            {t('survey.scan_btn')}\\n          </Text>"],
  [">\\n            General Health Information\\n          </Text>", ">\\n            {t('survey.info')}\\n          </Text>"],
  ["Blood Pressure (mmHg)", "{t('survey.bp')}"],
  ['placeholder="E.g. 120/80"', 'placeholder={t("survey.bp_placeholder")}'],
  ["Blood Sugar (mg/dL)", "{t('survey.sugar')}"],
  ['placeholder="E.g. 110"', 'placeholder={t("survey.sugar_placeholder")}'],
  ["Weight (kg)", "{t('survey.weight')}"],
  ['placeholder="E.g. 65"', 'placeholder={t("survey.weight_placeholder")}'],
  [">\\n              Save Health Record\\n            </Text>", ">\\n              {t('survey.save')}\\n            </Text>"]
]);

// 6. VISITS
fixScreen('app/visits.tsx', 'VisitsScreen', [
  [">\\n            Field Visits\\n          </Text>", ">\\n            {t('visits.title')}\\n          </Text>"],
  [">\\n            Schedule Visit\\n          </Text>", ">\\n            {t('visits.schedule_title')}\\n          </Text>"],
  [">\\n            Select Patient\\n          </Text>", ">\\n            {t('visits.select_patient')}\\n          </Text>"],
  ['placeholder="Search patients..."', 'placeholder={t("visits.search_patients")}'],
  [">\\n                  No patients found\\n                </Text>", ">\\n                  {t('visits.no_found')}\\n                </Text>"],
  [">\\n            Visit Reason\\n          </Text>", ">\\n            {t('visits.reason')}\\n          </Text>"],
  ['placeholder="E.g. Regular Checkup, ANC, Vaccination"', 'placeholder={t("visits.reason_placeholder")}'],
  [">\\n            Date & Time\\n          </Text>", ">\\n            {t('visits.datetime')}\\n          </Text>"],
  [">\\n              Schedule\\n            </Text>", ">\\n              {t('visits.schedule_btn')}\\n            </Text>"],
  [">\\n            Upcoming Visits\\n          </Text>", ">\\n            {t('visits.upcoming')}\\n          </Text>"],
  [">\\n              You have no upcoming visits scheduled.\\n            </Text>", ">\\n              {t('visits.no_upcoming')}\\n            </Text>"]
]);

// 7. PROFILE
fixScreen('app/profile.tsx', 'ProfileScreen', [
  [">Personal Information</Text>", ">{t('settings.personal_info')}</Text>"],
  [">Settings</Text>", ">{t('settings.settings')}</Text>"],
  [">Dark Mode</Text>", ">{t('settings.dark_mode')}</Text>"],
  [">Language</Text>", ">{t('settings.language')}</Text>"],
  [">Notifications</Text>", ">{t('settings.notifications')}</Text>"],
  [">Logout</Text>", ">{t('settings.logout')}</Text>"]
]);

// 8. SYNC
fixScreen('app/sync.tsx', 'ProfileScreen', [
  [">Offline Sync</Text>", ">{t('settings.sync_title')}</Text>"],
  [">24 records pending sync</Text>", ">24 {t('settings.pending')}</Text>"],
  [">Last synced: 2 hours ago</Text>", ">{t('settings.last_synced')}</Text>"],
  [">Sync Now</Text>", ">{t('settings.sync_now')}</Text>"]
]);
