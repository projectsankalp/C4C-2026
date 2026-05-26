async function runTests() {
  const baseUrl = 'http://localhost:3000/api';
  console.log('🏁 Starting automated integration verification tests for Asha+ Healthcare Backend...');

  // Helper wait function
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Wait a bit to ensure backend is fully booted
  console.log('⏳ Waiting for NestJS server to stabilize on port 3000...');
  await delay(3000);

  let adminAccessToken = '';
  let doctorAccessToken = '';
  let doctorRefreshToken = '';
  let testPatientId = '';

  try {
    // ----------------------------------------------------
    // TEST 1: Admin Login
    // ----------------------------------------------------
    console.log('\n🔐 [Test 1] Logging in as Admin...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ashaplus.org', password: 'AdminPass123!' }),
    });

    if (adminLoginRes.status !== 200) {
      throw new Error(`Admin login failed with status ${adminLoginRes.status}`);
    }

    const adminLoginData = await adminLoginRes.json();
    adminAccessToken = adminLoginData.accessToken;
    console.log('✅ Admin logged in successfully! Name:', adminLoginData.user.name);

    // ----------------------------------------------------
    // TEST 2: Doctor Login
    // ----------------------------------------------------
    console.log('\n🔐 [Test 2] Logging in as Doctor Verma...');
    const doctorLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor.verma@ashaplus.org', password: 'DoctorPass123!' }),
    });

    if (doctorLoginRes.status !== 200) {
      throw new Error(`Doctor login failed with status ${doctorLoginRes.status}`);
    }

    const doctorLoginData = await doctorLoginRes.json();
    doctorAccessToken = doctorLoginData.accessToken;
    doctorRefreshToken = doctorLoginData.refreshToken;
    console.log('✅ Doctor logged in successfully! Name:', doctorLoginData.user.name);

    // ----------------------------------------------------
    // TEST 3: Admin access clinical records (Demographic Privacy enforcement)
    // ----------------------------------------------------
    console.log('\n🛡️ [Test 3] Fetching patient records as ADMIN (Checking demographic privacy censorship)...');
    const adminPatientsRes = await fetch(`${baseUrl}/patients`, {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
    });

    if (adminPatientsRes.status !== 200) {
      throw new Error(`Admin patients retrieval failed with status ${adminPatientsRes.status}`);
    }

    const adminPatients = await adminPatientsRes.json();
    console.log(`Received ${adminPatients.length} patient records.`);
    
    // Inspect a patient record to verify clinical details are censored
    const sunitaRecord = adminPatients.find((p: any) => p.name === 'Sunita Devi');
    if (sunitaRecord) {
      console.log('Censored record check (Sunita Devi):');
      console.log(' - Name:', sunitaRecord.name);
      console.log(' - Age:', sunitaRecord.age);
      console.log(' - Village:', sunitaRecord.village);
      console.log(' - Blood Pressure:', sunitaRecord.bloodPressure);
      console.log(' - Glucose Level:', sunitaRecord.glucoseLevel);
      console.log(' - Risk Level:', sunitaRecord.riskLevel);

      if (
        sunitaRecord.bloodPressure === '*** (Doctor Only)' &&
        sunitaRecord.glucoseLevel === null &&
        sunitaRecord.riskLevel === '*** (Doctor Only)'
      ) {
        console.log('✅ PASS: Clinical details censored dynamically for Admin!');
      } else {
        throw new Error('❌ FAIL: Clinical data is visible to ADMIN!');
      }
    } else {
      throw new Error('Patient Sunita Devi not found in seeded database!');
    }

    // ----------------------------------------------------
    // TEST 4: Doctor access clinical records (Full access)
    // ----------------------------------------------------
    console.log('\n🔬 [Test 4] Fetching patient records as DOCTOR...');
    const doctorPatientsRes = await fetch(`${baseUrl}/patients`, {
      headers: { Authorization: `Bearer ${doctorAccessToken}` },
    });

    if (doctorPatientsRes.status !== 200) {
      throw new Error(`Doctor patients retrieval failed with status ${doctorPatientsRes.status}`);
    }

    const doctorPatients = await doctorPatientsRes.json();
    const sunitaRecordDoc = doctorPatients.find((p: any) => p.name === 'Sunita Devi');
    if (sunitaRecordDoc) {
      console.log('Doctor record check (Sunita Devi):');
      console.log(' - Blood Pressure:', sunitaRecordDoc.bloodPressure);
      console.log(' - Glucose Level:', sunitaRecordDoc.glucoseLevel);
      console.log(' - Risk Level:', sunitaRecordDoc.riskLevel);

      if (
        sunitaRecordDoc.bloodPressure !== '*** (Doctor Only)' &&
        sunitaRecordDoc.glucoseLevel !== null &&
        sunitaRecordDoc.riskLevel !== '*** (Doctor Only)'
      ) {
        console.log('✅ PASS: Clinical details fully visible to Doctor!');
      } else {
        throw new Error('❌ FAIL: Clinical data censored for DOCTOR!');
      }
    }

    // ----------------------------------------------------
    // TEST 5: Admin attempts clinical actions
    // ----------------------------------------------------
    console.log('\n🚫 [Test 5] ADMIN attempting to access diagnosis logs (Access Restriction check)...');
    const adminDiagRes = await fetch(`${baseUrl}/diagnosis`, {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
    });

    if (adminDiagRes.status === 403) {
      console.log('✅ PASS: ADMIN blocked from diagnosis logs (403 Forbidden)!');
    } else {
      throw new Error(`❌ FAIL: ADMIN was not blocked from diagnosis! Status: ${adminDiagRes.status}`);
    }

    console.log('\n🚫 ADMIN attempting to access prescriptions (Access Restriction check)...');
    const adminPrescRes = await fetch(`${baseUrl}/prescriptions`, {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
    });

    if (adminPrescRes.status === 403) {
      console.log('✅ PASS: ADMIN blocked from prescriptions (403 Forbidden)!');
    } else {
      throw new Error(`❌ FAIL: ADMIN was not blocked from prescriptions! Status: ${adminPrescRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 6: Doctor registers a new patient (High-risk automatic alert trigger check)
    // ----------------------------------------------------
    console.log('\n📝 [Test 6] DOCTOR creating a new HIGH-RISK patient...');
    const newPatientRes = await fetch(`${baseUrl}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorAccessToken}`,
      },
      body: JSON.stringify({
        name: 'Karan Malhotra',
        age: 58,
        gender: 'Male',
        village: 'Gopalpur',
        phone: '9911223344',
        bloodPressure: '150/95',
        glucoseLevel: 180.5,
        riskLevel: 'HIGH',
        status: 'CRITICAL',
      }),
    });

    if (newPatientRes.status !== 201) {
      throw new Error(`Patient creation failed with status ${newPatientRes.status}`);
    }

    const newPatient = await newPatientRes.json();
    testPatientId = newPatient.id;
    console.log('✅ Patient Karan Malhotra registered successfully! ID:', testPatientId);

    // ----------------------------------------------------
    // TEST 7: High-risk notification check
    // ----------------------------------------------------
    console.log('\n🔔 [Test 7] Verifying if High-Risk Notification is generated for Doctor Verma...');
    const notificationsRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${doctorAccessToken}` },
    });

    if (notificationsRes.status !== 200) {
      throw new Error(`Notifications retrieval failed with status ${notificationsRes.status}`);
    }

    const notifications = await notificationsRes.json();
    const highRiskAlert = notifications.find((n: any) => n.title.includes('High-Risk Alert') && n.message.includes('Karan Malhotra'));
    
    if (highRiskAlert) {
      console.log('✅ PASS: High-risk triage notification created successfully!');
      console.log(' - Title:', highRiskAlert.title);
      console.log(' - Message:', highRiskAlert.message);
    } else {
      throw new Error('❌ FAIL: High-risk alert notification not found!');
    }

    // ----------------------------------------------------
    // TEST 8: Token Refresh Rotation Check
    // ----------------------------------------------------
    console.log('\n🔄 [Test 8] Rotating Access Token using Refresh Token...');
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: doctorRefreshToken }),
    });

    if (refreshRes.status !== 200) {
      throw new Error(`Token refresh failed with status ${refreshRes.status}`);
    }

    const refreshData = await refreshRes.json();
    if (refreshData.accessToken && refreshData.refreshToken) {
      console.log('✅ PASS: Access token rotated successfully!');
    } else {
      throw new Error('❌ FAIL: Rotation did not return tokens!');
    }

    // ----------------------------------------------------
    // TEST 9: Analytics Dashboard (Admin ONLY)
    // ----------------------------------------------------
    console.log('\n📊 [Test 9] Fetching healthcare analytics dashboard as ADMIN...');
    const adminAnalyticsRes = await fetch(`${baseUrl}/analytics`, {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
    });

    if (adminAnalyticsRes.status !== 200) {
      throw new Error(`Analytics retrieval failed with status ${adminAnalyticsRes.status}`);
    }

    const analytics = await adminAnalyticsRes.json();
    console.log('✅ Dashboard Analytics successfully loaded:');
    console.log(' - High Risk Patient Count:', analytics.highRiskPatientCount);
    console.log(' - Risk Level Distribution:', JSON.stringify(analytics.riskDistribution));
    console.log(' - Village heatmaps count:', analytics.villageData.length);
    console.log(' - Doctor Workloads counts:', analytics.doctorWorkload.length);

    console.log('\n🚫 DOCTOR attempting to access analytics dashboard (Access Restriction check)...');
    const doctorAnalyticsRes = await fetch(`${baseUrl}/analytics`, {
      headers: { Authorization: `Bearer ${doctorAccessToken}` },
    });

    if (doctorAnalyticsRes.status === 403) {
      console.log('✅ PASS: DOCTOR blocked from analytics (403 Forbidden)!');
    } else {
      throw new Error(`❌ FAIL: DOCTOR was not blocked from analytics! Status: ${doctorAnalyticsRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 10: Audit Log trail verification
    // ----------------------------------------------------
    console.log('\n📁 [Test 10] Retrieving audit log trail as ADMIN...');
    const auditRes = await fetch(`${baseUrl}/audit`, {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
    });

    if (auditRes.status !== 200) {
      throw new Error(`Audit log retrieval failed with status ${auditRes.status}`);
    }

    const auditLogs = await auditRes.json();
    console.log(`Successfully retrieved ${auditLogs.length} audit logs.`);
    
    const writeLog = auditLogs.find((log: any) => log.action.includes('POST Patient'));
    if (writeLog) {
      console.log('✅ PASS: Audit log captured patient creation write action successfully!');
      console.log(' - User ID:', writeLog.userId);
      console.log(' - Action:', writeLog.action);
      console.log(' - Module:', writeLog.module);
      console.log(' - IP Address:', writeLog.ipAddress);
    } else {
      throw new Error('❌ FAIL: Write action audit log not found!');
    }

    console.log('\n🎉 ALL 10 INTEGRATION VERIFICATION TESTS PASSED SUCCESSFULLY! 100% COMPLIANT.');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ INTEGRATION VERIFICATION TEST FAILED:', error.message);
    process.exit(1);
  }
}

runTests();
