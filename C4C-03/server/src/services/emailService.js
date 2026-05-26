const fs = require('fs');
const path = require('path');
const transporter = require('../config/mailer');

function loadTemplate(name, vars) {
  const filePath = path.join(__dirname, '../templates', name);
  let html = fs.readFileSync(filePath, 'utf8');
  Object.entries(vars).forEach(([key, val]) => {
    html = html.replaceAll(`{{${key}}}`, val || '—');
  });
  return html;
}

async function sendHighRiskAlert(patient, screening, ashaWorker) {
  const vars = {
    patientName: patient.name,
    age: patient.age,
    gender: patient.gender,
    village: patient.village,
    systolic: screening.vitals?.systolic,
    diastolic: screening.vitals?.diastolic,
    bloodSugar: screening.vitals?.bloodSugar,
    bmi: screening.vitals?.bmi,
    score: screening.result?.score,
    flags: screening.result?.flags?.join(', '),
    ashaName: ashaWorker?.name || 'ASHA Worker',
    ashaPhone: ashaWorker?.phone || '—',
    screenedAt: new Date().toLocaleString('en-IN'),
    dashboardUrl: `${process.env.CLIENT_URL}/doctor/dashboard`
  };

  const html = loadTemplate('highRiskAlert.html', vars);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.DOCTOR_EMAIL,
    subject: `🚨 High Risk Patient — ${patient.name}, ${patient.village}`,
    html
  });

  console.log(`📧 High risk alert sent to doctor for patient: ${patient.name}`);
}

async function sendReferralNotice(patient, screening, doctor, referral) {
  const vars = {
    patientName: patient.name,
    age: patient.age,
    gender: patient.gender,
    village: patient.village,
    phone: patient.phone,
    systolic: screening.vitals?.systolic,
    diastolic: screening.vitals?.diastolic,
    bloodSugar: screening.vitals?.bloodSugar,
    flags: screening.result?.flags?.join(', '),
    doctorName: doctor?.name || 'PHC Doctor',
    doctorFacility: 'PHC',
    ashaName: '—',
    ashaPhone: '—',
    reason: referral.reason,
    date: new Date().toLocaleDateString('en-IN')
  };

  const html = loadTemplate('referralNotice.html', vars);

  const to = referral.referredToEmail || process.env.HOSPITAL_EMAIL;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `📋 Patient Referral — ${patient.name} | NirAmaya`,
    html
  });

  console.log(`📧 Referral notice sent to hospital for patient: ${patient.name}`);
}

async function sendFollowUpReminder(overdueList) {
  if (!overdueList.length) return;

  const rows = overdueList.map(f =>
    `<li>${f.patientId?.name || 'Patient'} — ${f.patientId?.village || ''} — Due: ${new Date(f.dueDate).toLocaleDateString('en-IN')}</li>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;padding:20px">
      <h2 style="color:#d97706">⏰ Follow-Up Reminders — NirAmaya</h2>
      <p>${overdueList.length} patient(s) have overdue follow-ups today:</p>
      <ul>${rows}</ul>
      <p>Please coordinate with ASHA workers to complete these follow-ups.</p>
      <p style="font-size:12px;color:#999">NirAmaya — Automated Daily Reminder</p>
    </div>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.DOCTOR_EMAIL,
    subject: `⏰ ${overdueList.length} Overdue Follow-Ups — NirAmaya`,
    html
  });

  console.log(`📧 Follow-up reminder sent: ${overdueList.length} overdue`);
}

module.exports = { sendHighRiskAlert, sendReferralNotice, sendFollowUpReminder };
