/**
 * GraamSehat ASHA Worker App - Firebase Sync Service
 * Path: /src/firebase/sync.js
 * Processes the local syncQueue, uploading records in batches to Firestore,
 * and updates local record status upon success.
 */

import { doc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { firestore } from "./config";
import { db } from "../db/localDB";
import { getPendingQueue, removeFromSyncQueue, incrementSyncAttempts } from "../db/pendingSync.local";
import { uploadPatientPhoto } from "./patients";

// Helper to map medicine ID/name to standard PascalCase keys for the Admin Dashboard
const getMedKey = (nameOrId) => {
  const val = (nameOrId || "").toLowerCase();
  if (val.includes("metformin")) return "Metformin";
  if (val.includes("amlodipine")) return "Amlodipine";
  if (val.includes("atenolol")) return "Atenolol";
  if (val.includes("ors")) return "ORS";
  if (val.includes("iron")) return "Iron";
  if (val.includes("folic")) return "FolicAcid";
  return nameOrId;
};

/**
 * Iterates over pending sync records and attempts to push them to Firestore.
 * @returns {Promise<number>} Number of successfully synced records
 */
export async function syncPendingRecords() {
  const queue = await getPendingQueue();
  let syncCount = 0;

  for (const item of queue) {
    const { id: queueId, table, localId, operation, data } = item;
    const cleanUid = data.uid.replace(/-/g, "").trim();

    try {
      if (table === "patients") {
        let photoUrl = data.photo;
        // Upload photo to Firebase storage if it is a base64 string
        if (photoUrl && photoUrl.startsWith("data:image")) {
          photoUrl = await uploadPatientPhoto(data.uid, photoUrl);
        }

        const firestorePayload = {
          uid: data.uid,
          name: data.name,
          age: data.age,
          gender: data.gender,
          village: data.village,
          district: data.district,
          phone: data.phone,
          aadhaarEncrypted: data.aadhaarEncrypted || "",
          bloodGroup: data.bloodGroup,
          photo: photoUrl,
          ashaWorkerId: data.ashaWorkerId,
          createdAt: data.createdAt,
          riskLevel: data.riskLevel || "GREEN", // baseline risk
          syncStatus: "synced"
        };

        // Write to patients/{uid}
        const patientDocRef = doc(firestore, "patients", cleanUid);
        await setDoc(patientDocRef, firestorePayload);

        // Automatically resolve any pending "notRegisteredRequests" for this UID
        try {
          const reqDocRef = doc(firestore, "notRegisteredRequests", cleanUid);
          await setDoc(reqDocRef, { resolved: true, resolvedAt: Date.now() }, { merge: true });
        } catch (err) {
          console.warn("Failed to update notRegisteredRequests, skipping...", err);
        }

        // Update local Dexie record
        await db.patients.update(localId, {
          photo: photoUrl,
          syncStatus: "synced",
          firebaseDocId: cleanUid
        });

        // Remove from local syncQueue
        await removeFromSyncQueue(queueId);
        syncCount++;
      }
      
      else if (table === "screenings") {
        // Fetch patient name and district
        const patient = await db.patients.where("uid").equals(data.uid).first();
        const patientName = patient ? patient.name : "Unknown Patient";
        const district = patient ? patient.district : "Unknown District";
        
        let ashaName = "ASHA Worker";
        try {
          const cachedProfile = localStorage.getItem(`asha_profile_${data.ashaWorkerId}`);
          if (cachedProfile) {
            const parsed = JSON.parse(cachedProfile);
            if (parsed && parsed.name) {
              ashaName = parsed.name;
            }
          }
        } catch (e) {
          console.warn("Could not get ASHA worker name from cache", e);
        }

        const firestorePayload = {
          uid: data.uid,
          date: data.date,
          idrsScore: data.idrsScore,
          bpSystolic: data.bpSystolic,
          bpDiastolic: data.bpDiastolic,
          glucoseLevel: data.glucoseLevel,
          riskLevel: data.riskLevel,
          overallRisk: data.overallRisk,
          doctorsNote: data.doctorsNote,
          symptoms: data.symptoms,
          ashaWorkerId: data.ashaWorkerId,
          syncStatus: "synced"
        };

        // 1. Write to patients/{uid}/screenings/{autoId}
        const screeningsColRef = collection(firestore, "patients", cleanUid, "screenings");
        const docRef = await addDoc(screeningsColRef, firestorePayload);

        // 2. Double-write to root screenings collection for Admin Reports
        const rootPayload = {
          patientUid: data.uid,
          patientId: cleanUid,
          patientName: patientName,
          district: district,
          ashaName: ashaName,
          ashaWorkerId: data.ashaWorkerId,
          timestamp: data.date,
          date: data.date,
          systolic: data.bpSystolic,
          diastolic: data.bpDiastolic,
          glucose: data.glucoseLevel,
          idrs: data.idrsScore,
          riskLevel: data.overallRisk ? data.overallRisk.toLowerCase() : "green",
          symptoms: data.symptoms || [],
          syncStatus: "synced"
        };
        const rootScreeningsColRef = collection(firestore, "screenings");
        await addDoc(rootScreeningsColRef, rootPayload);

        // 3. Update the parent patients/{uid} document with latest vitals and risk
        const patientDocRef = doc(firestore, "patients", cleanUid);
        await setDoc(patientDocRef, {
          riskLevel: data.overallRisk || "GREEN",
          lastScreeningDate: data.date,
          lastScreened: data.date,
          bpSystolic: data.bpSystolic,
          bpDiastolic: data.bpDiastolic,
          glucoseLevel: data.glucoseLevel,
          idrsScore: data.idrsScore
        }, { merge: true });

        // Update local Dexie record
        await db.screenings.update(localId, {
          syncStatus: "synced",
          firebaseDocId: docRef.id
        });

        // Remove from local syncQueue
        await removeFromSyncQueue(queueId);
        syncCount++;
      }
      
      else if (table === "medicines") {
        // Fetch patient and worker name
        const patient = await db.patients.where("uid").equals(data.uid).first();
        const patientName = patient ? patient.name : "Unknown Patient";
        const district = patient ? patient.district : "Unknown District";
        
        let ashaName = "ASHA Worker";
        try {
          const cachedProfile = localStorage.getItem(`asha_profile_${data.ashaWorkerId}`);
          if (cachedProfile) {
            const parsed = JSON.parse(cachedProfile);
            if (parsed && parsed.name) {
              ashaName = parsed.name;
            }
          }
        } catch (e) {
          console.warn("Could not get ASHA worker name from cache", e);
        }

        const firestorePayload = {
          uid: data.uid,
          medicineName: data.medicineName,
          dose: data.dose,
          quantity: data.quantity,
          distributedAt: data.distributedAt,
          nextDueDate: data.nextDueDate,
          ashaWorkerId: data.ashaWorkerId,
          syncStatus: "synced"
        };

        // 1. Write to patients/{uid}/medicines/{autoId}
        const medsColRef = collection(firestore, "patients", cleanUid, "medicines");
        await addDoc(medsColRef, firestorePayload);

        // 2. Double-write to root screenings for Admin Medicine Distribution report
        const rootMedPayload = {
          patientUid: data.uid,
          patientId: cleanUid,
          patientName: patientName,
          district: district,
          ashaName: ashaName,
          ashaWorkerId: data.ashaWorkerId,
          timestamp: data.distributedAt,
          date: data.distributedAt,
          medicinesDistributed: {
            [getMedKey(data.medicineName)]: Number(data.quantity)
          },
          syncStatus: "synced"
        };
        const rootScreeningsColRef = collection(firestore, "screenings");
        await addDoc(rootScreeningsColRef, rootMedPayload);

        // Update local Dexie record
        await db.medicines.update(localId, {
          syncStatus: "synced"
        });

        // Remove from local syncQueue
        await removeFromSyncQueue(queueId);
        syncCount++;
      }
    } catch (error) {
      console.error(`Failed to sync queue item ${queueId} (Table: ${table}, LocalId: ${localId})`, error);
      await incrementSyncAttempts(queueId);
    }
  }

  return syncCount;
}

/**
 * Fetches all patient registries, screenings, and medicines from Firestore
 * and merges them into the local Dexie DB.
 */
export async function pullPatientsFromFirestore() {
  try {
    const patientsCol = collection(firestore, "patients");
    const patientsSnapshot = await getDocs(patientsCol);
    
    for (const patientDoc of patientsSnapshot.docs) {
      const patientData = patientDoc.data();
      const patientId = patientDoc.id; // cleanUid
      
      const localPatient = {
        uid: patientData.uid || patientId,
        name: patientData.name || "",
        age: patientData.age || "",
        gender: patientData.gender || "",
        village: patientData.village || "",
        district: patientData.district || "",
        phone: patientData.phone || "",
        aadhaarEncrypted: patientData.aadhaarEncrypted || "",
        bloodGroup: patientData.bloodGroup || "",
        photo: patientData.photo || null,
        ashaWorkerId: patientData.ashaWorkerId || "",
        createdAt: patientData.createdAt || Date.now(),
        riskLevel: patientData.riskLevel || "GREEN",
        syncStatus: "synced",
        firebaseDocId: patientId
      };
      
      // Upsert to local patients Dexie table
      await db.patients.put(localPatient);
      
      // Pull screenings subcollection
      const screeningsCol = collection(firestore, "patients", patientId, "screenings");
      const screeningsSnapshot = await getDocs(screeningsCol);
      for (const scrDoc of screeningsSnapshot.docs) {
        const scrData = scrDoc.data();
        const localScr = {
          uid: scrData.uid,
          date: scrData.date || Date.now(),
          idrsScore: scrData.idrsScore || 0,
          bpSystolic: scrData.bpSystolic || 120,
          bpDiastolic: scrData.bpDiastolic || 80,
          glucoseLevel: scrData.glucoseLevel || 100,
          riskLevel: scrData.riskLevel || "low",
          overallRisk: scrData.overallRisk || "GREEN",
          doctorsNote: scrData.doctorsNote || "",
          symptoms: scrData.symptoms || [],
          ashaWorkerId: scrData.ashaWorkerId || "",
          syncStatus: "synced",
          firebaseDocId: scrDoc.id
        };
        
        const exists = await db.screenings.where("firebaseDocId").equals(scrDoc.id).first();
        if (exists) {
          await db.screenings.update(exists.id, localScr);
        } else {
          await db.screenings.add(localScr);
        }
      }
      
      // Pull medicines subcollection
      const medsCol = collection(firestore, "patients", patientId, "medicines");
      const medsSnapshot = await getDocs(medsCol);
      for (const medDoc of medsSnapshot.docs) {
        const medData = medDoc.data();
        const localMed = {
          uid: medData.uid,
          medicineName: medData.medicineName || "",
          dose: medData.dose || "",
          quantity: Number(medData.quantity) || 0,
          distributedAt: medData.distributedAt || Date.now(),
          nextDueDate: medData.nextDueDate || null,
          ashaWorkerId: medData.ashaWorkerId || "",
          syncStatus: "synced"
        };
        
        const exists = await db.medicines
          .where("distributedAt")
          .equals(medData.distributedAt)
          .and(m => m.medicineName === medData.medicineName)
          .first();
          
        if (!exists) {
          await db.medicines.add(localMed);
        }
      }
    }
    console.log("Successfully pulled registry updates from Firestore.");
  } catch (error) {
    console.error("Error pulling patient registry from Firestore:", error);
    throw error;
  }
}
