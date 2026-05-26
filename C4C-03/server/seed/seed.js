require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Patient = require('../src/models/Patient.model');
const Screening = require('../src/models/Screening.model');
const usersData = require('./users.json');
const patientsData = require('./patients.json');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Screening.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await Promise.all(usersData.map(u => new User(u).save()));
    console.log(`Created ${users.length} users`);

    const ashaWorker = users.find(u => u.role === 'asha');

    // Create patients with reference to asha
    const patients = await Promise.all(
      patientsData.map(p => new Patient({ ...p, ashaId: ashaWorker._id }).save())
    );
    console.log(`Created ${patients.length} patients`);

    // Create sample screenings
    const sampleScreenings = [
      {
        patientId: patients[0]._id,
        ashaId: ashaWorker._id,
        vitals: { systolic: 162, diastolic: 104, bloodSugar: 218, weight: 82, height: 168, bmi: 29.1, waist: 98 },
        symptoms: { urination: true, thirst: true, vision: false, headache: true, fatigue: true, numbness: false },
        riskFactors: { familyDiabetes: true, familyBP: false, smoking: 'yes', alcohol: false, exercise: 'none', stress: 'high' },
        pregnancy: { isPregnant: false, gestationalHistory: false }
      },
      {
        patientId: patients[1]._id,
        ashaId: ashaWorker._id,
        vitals: { systolic: 138, diastolic: 88, bloodSugar: 145, weight: 68, height: 155, bmi: 28.3, waist: 89 },
        symptoms: { urination: true, thirst: true, vision: false, headache: false, fatigue: true, numbness: false },
        riskFactors: { familyDiabetes: true, familyBP: true, smoking: 'no', alcohol: false, exercise: 'moderate', stress: 'medium' },
        pregnancy: { isPregnant: false, gestationalHistory: true }
      },
      {
        patientId: patients[2]._id,
        ashaId: ashaWorker._id,
        vitals: { systolic: 118, diastolic: 76, bloodSugar: 95, weight: 70, height: 172, bmi: 23.7, waist: 80 },
        symptoms: { urination: false, thirst: false, vision: false, headache: false, fatigue: false, numbness: false },
        riskFactors: { familyDiabetes: false, familyBP: false, smoking: 'no', alcohol: false, exercise: 'active', stress: 'low' },
        pregnancy: { isPregnant: false, gestationalHistory: false }
      }
    ];

    const { calculateRisk } = require('../src/engine/riskEngine');
    const generateFollowUpDate = require('../src/utils/generateFollowUpDate');
    const FollowUp = require('../src/models/FollowUp.model');
    const Alert = require('../src/models/Alert.model');

    for (const s of sampleScreenings) {
      const patient = patients.find(p => p._id.equals(s.patientId));
      const result = calculateRisk({ age: patient.age, vitals: s.vitals, symptoms: s.symptoms, riskFactors: s.riskFactors, pregnancy: s.pregnancy });
      const screening = await new Screening({ ...s, result }).save();

      await new FollowUp({
        patientId: s.patientId,
        screeningId: screening._id,
        dueDate: generateFollowUpDate(result.riskLevel)
      }).save();

      if (result.riskLevel === 'HIGH') {
        await new Alert({ patientId: s.patientId, screeningId: screening._id, riskLevel: 'HIGH' }).save();
      }
    }

    console.log('Created sample screenings, follow-ups, and alerts');
    console.log('\n✅ Seed complete!\n');
    console.log('Demo credentials:');
    console.log('  ASHA: ASHA001 / 1234');
    console.log('  Doctor: doctor@phc.com / doctor123');
    console.log('  Hospital: hospital@chc.com / hospital123');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
