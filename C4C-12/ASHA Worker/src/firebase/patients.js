/**
 * GraamSehat ASHA Worker App - Firebase Firestore Patient Operations
 * Path: /src/firebase/patients.js
 * Performs queries on the remote Firestore database for online verification
 * and handles patient photo uploads to Firebase Storage.
 */

import { doc, getDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "./config";

/**
 * Checks Firestore for an existing patient record by UID.
 * @param {string} uid - Patient UID (e.g. 29-04821-7)
 * @returns {Promise<object|null>} Patient data or null
 */
export async function getRemotePatientByUid(uid) {
  try {
    const cleanUid = uid.replace(/-/g, "").trim();
    // We store using the formatted UID or clean UID as the document ID
    // Let's check with the clean UID or format UID. Standardize doc path as patients/{cleanUid}
    const docRef = doc(firestore, "patients", cleanUid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch remote patient by UID: ${uid}`, error);
    return null;
  }
}

/**
 * Uploads a base64 photo to Firebase Storage and returns the download URL.
 * Falls back to returning the base64 string on failure or lack of permissions.
 * @param {string} uid - Patient UID
 * @param {string} base64Photo - Data URI string of the photo
 * @returns {Promise<string>} Uploaded photo URL or original base64 string
 */
export async function uploadPatientPhoto(uid, base64Photo) {
  if (!base64Photo || !base64Photo.startsWith("data:image")) {
    return base64Photo;
  }

  try {
    const cleanUid = uid.replace(/-/g, "").trim();
    const storageRef = ref(storage, `patient_photos/${cleanUid}.jpg`);
    
    // Upload the base64 data string
    await uploadString(storageRef, base64Photo, "data_url");
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.warn("Storage upload failed or skipped (may be due to security rules). Storing base64 locally/remotely.", error);
    return base64Photo; // Return base64 as fallback so photo functionality is never broken
  }
}
