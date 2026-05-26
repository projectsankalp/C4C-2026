/**
 * seed-db.js
 * Script to seed pre-configured demo users directly into your live Firestore database.
 * Paths cleared: patients, users, screenings, familyLinks, restockRequests, adminActivityLog, lostFoundLog, otpLogs, and notRegisteredRequests.
 * Generates 25 Luhn-valid patients, baseline screenings, linked families, 3 ASHA workers, and 1 Admin.
 * Run using: npm run seed
 */

import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app, db } from './src/firebase/config.js';

const auth = getAuth(app);

// Helper to calculate Luhn check digit and return a 6-digit valid UID string
function generateLuhnValidUID(index) {
  const base = 10000 + index; // base 5-digit number
  const digits = String(base).split('').map(Number);
  
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    // Double every alternate digit starting from the right (index 4, 2, 0)
    if ((digits.length - i) % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${base}${checkDigit}`;
}

// Clean collection helper
async function deleteCollection(collectionName) {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    let count = 0;
    
    for (const docSnap of snapshot.docs) {
      // 1. Delete patient subcollections
      if (collectionName === 'patients') {
        const scrRef = collection(db, 'patients', docSnap.id, 'screenings');
        const scrSnap = await getDocs(scrRef);
        for (const scrDoc of scrSnap.docs) {
          await deleteDoc(scrDoc.ref);
        }
        
        const medRef = collection(db, 'patients', docSnap.id, 'medicines');
        const medSnap = await getDocs(medRef);
        for (const medDoc of medSnap.docs) {
          await deleteDoc(medDoc.ref);
        }
      }
      
      // 2. Delete familyLinks subcollections
      if (collectionName === 'familyLinks') {
        const memRef = collection(db, 'familyLinks', docSnap.id, 'members');
        const memSnap = await getDocs(memRef);
        for (const memDoc of memSnap.docs) {
          await deleteDoc(memDoc.ref);
        }
      }
      
      await deleteDoc(docSnap.ref);
      count++;
    }
    if (count > 0) {
      console.log(`🧹 Cleared ${count} records from collection: ${collectionName}`);
    }
  } catch (err) {
    console.warn(`Warning clearing collection ${collectionName}:`, err.message);
  }
}

async function runSeeder() {
  console.log('==================================================');
  console.log('🚀 GraamSehat Firestore Database Purge & Seed');
  console.log('==================================================');
  
  try {
    // 1. Purge database
    const collectionsToClear = [
      'patients',
      'users',
      'screenings',
      'familyLinks',
      'restockRequests',
      'adminActivityLog',
      'lostFoundLog',
      'otpLogs',
      'notRegisteredRequests'
    ];
    
    console.log('Step 1: Purging all existing collections...');
    for (const col of collectionsToClear) {
      await deleteCollection(col);
    }
    console.log('Purge completed.\n');

    // 2. Create ASHA workers and Admin auth accounts
    console.log('Step 2: Creating ASHA Workers & Admin accounts...');
    const usersToCreate = [
      { email: 'asha1.gs@graamsehat.org', password: 'password123', name: 'Asha Gowda', role: 'asha', village: 'Mangalapura', district: 'Tumakuru (Tumkur)' },
      { email: 'asha2.gs@graamsehat.org', password: 'password123', name: 'Asha Nayak', role: 'asha', village: 'Gollahalli', district: 'Tumakuru (Tumkur)' },
      { email: 'asha3.gs@graamsehat.org', password: 'password123', name: 'Asha Patil', role: 'asha', village: 'Kyathsandra', district: 'Tumakuru (Tumkur)' },
      { email: 'admin.gs@graamsehat.org', password: 'password123', name: 'Admin Officer', role: 'admin' }
    ];

    const seededUsers = [];

    for (const u of usersToCreate) {
      let uid;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, u.email, u.password);
        uid = userCredential.user.uid;
        console.log(`Created Auth account: ${u.email}`);
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          const userCredential = await signInWithEmailAndPassword(auth, u.email, u.password);
          uid = userCredential.user.uid;
          console.log(`Auth account already exists: ${u.email} (${uid})`);
        } else {
          throw err;
        }
      }

      // Write user document to Firestore
      const userRef = doc(db, 'users', uid);
      const userDoc = {
        uid,
        name: u.name,
        email: u.email,
        role: u.role,
        status: 'approved',
        createdAt: Date.now()
      };
      if (u.role === 'asha') {
        userDoc.subcentre = 'GraamSehat Sub-Centre';
        userDoc.village = u.village;
        userDoc.district = u.district;
        userDoc.medicines = {
          Metformin: 100,
          Amlodipine: 100,
          Atenolol: 100,
          ORS: 100,
          Iron: 100,
          FolicAcid: 100
        };
        seededUsers.push({ uid, name: u.name, village: u.village, district: u.district });
      }
      await setDoc(userRef, userDoc);
      console.log(`   └─ Seeded Firestore users document: ${u.email}`);
    }
    console.log('');

    // Sign in as asha1.gs@graamsehat.org to seed clinical data (satisfying Firestore rules)
    console.log('Signing in as asha1.gs@graamsehat.org to seed clinical data...');
    await signInWithEmailAndPassword(auth, 'asha1.gs@graamsehat.org', 'password123');
    console.log('Signed in successfully as ASHA worker.\n');

    // 3. Generate and seed 25 patients
    console.log('Step 3: Generating and seeding 25 Luhn-valid patient profiles & screening logs...');
    
    const patientNames = [
      { name: "Ramesh Kumar", age: 52, gender: "Male", bloodGroup: "O+", phone: "9876543210" },
      { name: "Lakshmi Gowda", age: 48, gender: "Female", bloodGroup: "A+", phone: "9845012345" },
      { name: "Venkatesh Prasad", age: 61, gender: "Male", bloodGroup: "B+", phone: "9900112233" },
      { name: "Saraswathi Bai", age: 70, gender: "Female", bloodGroup: "O-", phone: "9880112233" },
      { name: "Manjunath Swamy", age: 34, gender: "Male", bloodGroup: "AB+", phone: "9741223344" },
      { name: "Parvathi Devi", age: 55, gender: "Female", bloodGroup: "B-", phone: "9632114455" },
      { name: "Shankar Rao", age: 42, gender: "Male", bloodGroup: "O+", phone: "9513572468" },
      { name: "Anusuya Hegde", age: 65, gender: "Female", bloodGroup: "A-", phone: "9480113355" },
      { name: "Basavaraj Bommai", age: 59, gender: "Male", bloodGroup: "AB-", phone: "9448224466" },
      { name: "Girija Shettar", age: 31, gender: "Female", bloodGroup: "B+", phone: "9341335577" },
      { name: "Krishna Murthy", age: 68, gender: "Male", bloodGroup: "A+", phone: "9242446688" },
      { name: "Savitha Rao", age: 45, gender: "Female", bloodGroup: "O+", phone: "9141557799" },
      { name: "Suresh Angadi", age: 50, gender: "Male", bloodGroup: "B+", phone: "9048668800" },
      { name: "Rukmini Bhat", age: 57, gender: "Female", bloodGroup: "AB+", phone: "8971779911" },
      { name: "Anand Singh", age: 38, gender: "Male", bloodGroup: "A-", phone: "8861880022" },
      { name: "Shobha Karandlaje", age: 53, gender: "Female", bloodGroup: "O-", phone: "8752991133" },
      { name: "Jagadish Shettar", age: 63, gender: "Male", bloodGroup: "B-", phone: "8643002244" },
      { name: "Leelavathi Amma", age: 72, gender: "Female", bloodGroup: "A+", phone: "8534113355" },
      { name: "Mallikarjun Kharge", age: 66, gender: "Male", bloodGroup: "AB-", phone: "8425224466" },
      { name: "Sumalatha Ambareesh", age: 49, gender: "Female", bloodGroup: "O+", phone: "8316335577" },
      { name: "Siddaramaiah Gowda", age: 64, gender: "Male", bloodGroup: "A+", phone: "8207446688" },
      { name: "Renukacharya Swamy", age: 41, gender: "Male", bloodGroup: "B+", phone: "8198557799" },
      { name: "Umashree Patil", age: 56, gender: "Female", bloodGroup: "AB+", phone: "8089668800" },
      { name: "Kumaraswamy Gowda", age: 58, gender: "Male", bloodGroup: "O+", phone: "7978779911" },
      { name: "Roopa D M", age: 36, gender: "Female", bloodGroup: "B+", phone: "7867880022" }
    ];

    const seededPatientUids = [];

    for (let i = 0; i < patientNames.length; i++) {
      const uid = generateLuhnValidUID(i);
      seededPatientUids.push(uid);
      
      const p = patientNames[i];
      
      // Rotate ASHA assignments
      const ashaIndex = i % seededUsers.length;
      const asha = seededUsers[ashaIndex];
      
      // Determine health metrics based on index (mix of Green, Yellow, Red)
      let overallRisk = 'GREEN';
      let bpSystolic = 115;
      let bpDiastolic = 75;
      let glucoseLevel = 90;
      let idrsScore = 20;
      let symptoms = ['none'];
      let medsDistributed = {};
      let docRemarks = 'Patient shows normal health parameters. Re-examine in 1 year.';

      if (i % 3 === 0) {
        // High Risk (RED)
        overallRisk = 'RED';
        bpSystolic = 150;
        bpDiastolic = 95;
        glucoseLevel = 160;
        idrsScore = 65;
        symptoms = ['frequent_urination', 'fatigue', 'excessive_thirst'];
        medsDistributed = { Metformin: 30, Amlodipine: 30 };
        docRemarks = 'Diagnosed with Stage 2 Hypertension & elevated glucose. Prescribed Metformin/Amlodipine. Refer to CHC immediately.';
      } else if (i % 3 === 1) {
        // Moderate Risk (YELLOW)
        overallRisk = 'YELLOW';
        bpSystolic = 135;
        bpDiastolic = 85;
        glucoseLevel = 120;
        idrsScore = 40;
        symptoms = ['fatigue'];
        medsDistributed = { ORS: 5, Iron: 30 };
        docRemarks = 'Stage 1 Elevated BP and prediabetic blood sugar range. Lifestyle modifications and monitoring advised.';
      }

      // Write patient profile to patients/{uid}
      const patientRef = doc(db, 'patients', uid);
      const patientDoc = {
        uid,
        name: p.name,
        age: p.age,
        gender: p.gender,
        village: asha.village,
        district: asha.district,
        phone: p.phone,
        bloodGroup: p.bloodGroup,
        photo: null,
        ashaWorkerId: asha.uid,
        createdAt: Date.now() - (10 * 24 * 60 * 60 * 1000), // registered 10 days ago
        riskLevel: overallRisk,
        lastScreened: Date.now() - (2 * 24 * 60 * 60 * 1000),
        lastScreeningDate: Date.now() - (2 * 24 * 60 * 60 * 1000),
        bpSystolic,
        bpDiastolic,
        glucoseLevel,
        idrsScore
      };
      await setDoc(patientRef, patientDoc);

      // Write screening subcollection log patients/{uid}/screenings/{date}
      const screeningDateStr = String(Date.now() - (2 * 24 * 60 * 60 * 1000));
      const subScreeningRef = doc(db, 'patients', uid, 'screenings', screeningDateStr);
      const screeningDoc = {
        uid,
        date: Number(screeningDateStr),
        idrsScore,
        bpSystolic,
        bpDiastolic,
        bpClassification: overallRisk === 'RED' ? 'STAGE_2' : overallRisk === 'YELLOW' ? 'STAGE_1' : 'NORMAL',
        glucoseLevel,
        glucoseClassification: overallRisk === 'RED' ? 'DIABETIC' : overallRisk === 'YELLOW' ? 'PREDIABETIC' : 'NORMAL',
        riskLevel: overallRisk === 'RED' ? 'high' : overallRisk === 'YELLOW' ? 'moderate' : 'low',
        overallRisk,
        doctorsNote: docRemarks,
        symptoms,
        ashaWorkerId: asha.uid,
        syncStatus: 'synced'
      };
      await setDoc(subScreeningRef, screeningDoc);

      // Write to root screenings collection
      const rootScreeningRef = doc(db, 'screenings', `SCR_${uid}_${screeningDateStr}`);
      const rootScreeningDoc = {
        patientUid: uid,
        patientId: uid,
        patientName: p.name,
        district: asha.district,
        ashaName: asha.name,
        ashaWorkerId: asha.uid,
        timestamp: Number(screeningDateStr),
        date: Number(screeningDateStr),
        systolic: bpSystolic,
        diastolic: bpDiastolic,
        glucose: glucoseLevel,
        idrs: idrsScore,
        riskLevel: overallRisk.toLowerCase(),
        symptoms,
        syncStatus: 'synced'
      };
      if (Object.keys(medsDistributed).length > 0) {
        rootScreeningDoc.medicinesDistributed = medsDistributed;
      }
      await setDoc(rootScreeningRef, rootScreeningDoc);

      // Seed medicine logs into subcollection patients/{uid}/medicines
      if (Object.keys(medsDistributed).length > 0) {
        for (const [medName, qty] of Object.entries(medsDistributed)) {
          const medDate = String(Date.now() - (2 * 24 * 60 * 60 * 1000));
          const subMedRef = doc(db, 'patients', uid, 'medicines', `MED_${medName}_${medDate}`);
          await setDoc(subMedRef, {
            uid,
            medicineName: medName,
            dose: medName === 'Metformin' ? '1 tablet twice daily' : '1 tablet once daily',
            quantity: qty,
            distributedAt: Number(medDate),
            nextDueDate: Date.now() + (28 * 24 * 60 * 60 * 1000),
            ashaWorkerId: asha.uid,
            syncStatus: 'synced'
          });
        }
      }

      console.log(`   └─ Seeded Patient #${i+1}: ${uid} (${p.name}) - Risk: ${overallRisk} (ASHA: ${asha.name})`);
    }
    console.log('');

    // 4. Seed Family Links
    console.log('Step 4: Creating family linkages...');
    // Link Ramesh Kumar (100008) and Lakshmi Gowda (100016)
    const primaryUID = seededPatientUids[0];
    const spouseUID = seededPatientUids[1];

    const linkRef1 = doc(db, 'familyLinks', primaryUID, 'members', spouseUID);
    await setDoc(linkRef1, {
      memberUID: spouseUID,
      relation: 'Spouse',
      addedAt: new Date().toISOString()
    });

    const linkRef2 = doc(db, 'familyLinks', spouseUID, 'members', primaryUID);
    await setDoc(linkRef2, {
      memberUID: primaryUID,
      relation: 'Spouse',
      addedAt: new Date().toISOString()
    });

    console.log(`✅ Family linkage established between ${primaryUID} and ${spouseUID}`);

    console.log('==================================================');
    console.log('🎉 Database Seeding & Setup completed successfully!');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeder();
