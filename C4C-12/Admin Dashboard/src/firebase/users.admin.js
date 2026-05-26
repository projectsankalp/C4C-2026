/**
 * GraamSehat Admin Dashboard - Admin Users & Operations Service
 * Location: /src/firebase/users.admin.js
 */

import { db, logAdminActivity } from './config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

/**
 * Fetches all ASHA workers (role === 'asha').
 * @returns {Promise<Array>}
 */
export const getASHAWorkers = async () => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'asha'));
    const querySnapshot = await getDocs(q);
    const workers = [];
    querySnapshot.forEach((doc) => {
      workers.push({ id: doc.id, ...doc.data() });
    });
    return workers;
  } catch (error) {
    console.error('Error fetching ASHA workers:', error);
    throw error;
  }
};

/**
 * Fetches all pending ASHA signups (status === 'pending').
 * @returns {Promise<Array>}
 */
export const getPendingASHAWorkers = async () => {
  try {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'asha'), 
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    const pending = [];
    querySnapshot.forEach((doc) => {
      pending.push({ id: doc.id, ...doc.data() });
    });
    return pending;
  } catch (error) {
    console.error('Error fetching pending ASHA workers:', error);
    throw error;
  }
};

/**
 * Approves a pending ASHA worker.
 * @param {string} adminId 
 * @param {string} workerId 
 */
export const approveASHAWorker = async (adminId, workerId) => {
  try {
    const docRef = doc(db, 'users', workerId);
    await updateDoc(docRef, {
      status: 'approved',
      approvedBy: adminId,
      approvedAt: serverTimestamp()
    });
    
    // Log admin activity
    await logAdminActivity(adminId, 'APPROVE_ASHA_WORKER', { workerId });
  } catch (error) {
    console.error('Error approving ASHA worker:', error);
    throw error;
  }
};

/**
 * Rejects a pending ASHA worker.
 * @param {string} adminId 
 * @param {string} workerId 
 * @param {string} reason 
 */
export const rejectASHAWorker = async (adminId, workerId, reason) => {
  try {
    const docRef = doc(db, 'users', workerId);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectionReason: reason,
      rejectedBy: adminId,
      rejectedAt: serverTimestamp()
    });
    
    // Log admin activity
    await logAdminActivity(adminId, 'REJECT_ASHA_WORKER', { workerId, reason });
  } catch (error) {
    console.error('Error rejecting ASHA worker:', error);
    throw error;
  }
};

/**
 * Toggles status between approved and suspended.
 * @param {string} adminId 
 * @param {string} workerId 
 * @param {string} newStatus - 'approved' or 'suspended'
 */
export const toggleASHAStatus = async (adminId, workerId, newStatus) => {
  try {
    const docRef = doc(db, 'users', workerId);
    await updateDoc(docRef, {
      status: newStatus
    });
    
    // Log admin activity
    await logAdminActivity(adminId, 'TOGGLE_ASHA_STATUS', { workerId, status: newStatus });
  } catch (error) {
    console.error('Error toggling ASHA worker status:', error);
    throw error;
  }
};

/**
 * Submits a medicine restock request.
 * @param {string} adminId 
 * @param {object} requestDetails - details of requested medicine restock
 */
export const createRestockRequest = async (adminId, requestDetails) => {
  try {
    const restockRef = collection(db, 'restockRequests');
    const docRef = await addDoc(restockRef, {
      ...requestDetails,
      requestedBy: adminId,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    // Immediately replenish the worker's stock levels in Firestore
    const workerRef = doc(db, 'users', requestDetails.ashaWorkerId);
    await updateDoc(workerRef, {
      medicines: {
        Metformin: 100,
        Amlodipine: 100,
        Atenolol: 100,
        ORS: 100,
        Iron: 100,
        FolicAcid: 100
      },
      lastRestocked: serverTimestamp()
    });

    // Log activity
    await logAdminActivity(adminId, 'CREATE_RESTOCK_REQUEST', {
      requestId: docRef.id,
      ashaWorkerId: requestDetails.ashaWorkerId,
      ashaName: requestDetails.ashaName
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating restock request:', error);
    throw error;
  }
};

/**
 * Fetches all education articles.
 * @returns {Promise<Array>}
 */
export const getEducationArticles = async () => {
  try {
    const q = query(collection(db, 'educationContent'), orderBy('lastUpdated', 'desc'));
    const querySnapshot = await getDocs(q);
    const articles = [];
    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() });
    });
    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

/**
 * Saves a new or existing education article.
 * @param {string} adminId 
 * @param {string|null} articleId - null for new article
 * @param {object} articleData 
 */
export const saveEducationArticle = async (adminId, articleId, articleData) => {
  try {
    const data = {
      ...articleData,
      lastUpdated: serverTimestamp()
    };
    
    if (articleId) {
      const docRef = doc(db, 'educationContent', articleId);
      await updateDoc(docRef, data);
      await logAdminActivity(adminId, 'UPDATE_EDUCATION_ARTICLE', { articleId, title: articleData.title.en });
    } else {
      const docRef = await addDoc(collection(db, 'educationContent'), data);
      await logAdminActivity(adminId, 'CREATE_EDUCATION_ARTICLE', { articleId: docRef.id, title: articleData.title.en });
    }
  } catch (error) {
    console.error('Error saving education article:', error);
    throw error;
  }
};

/**
 * Deletes an education article.
 * @param {string} adminId 
 * @param {string} articleId 
 */
export const deleteEducationArticle = async (adminId, articleId) => {
  try {
    const docRef = doc(db, 'educationContent', articleId);
    await deleteDoc(docRef);
    await logAdminActivity(adminId, 'DELETE_EDUCATION_ARTICLE', { articleId });
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
};
