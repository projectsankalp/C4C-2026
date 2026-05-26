import {

  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  getDocs,
  deleteDoc

} from 'firebase/firestore'

import { db } from './firebase'

/* USERS */

export const getUsersRealtime =
  (cb) => {

    const q = query(

      collection(db, 'users'),

      orderBy(
        'points',
        'desc'
      )

    )

    return onSnapshot(

      q,

      (snapshot) => {

        cb(

          snapshot.docs.map(
            (doc) => ({

              id: doc.id,

              ...doc.data()

            })
          )

        )

      }

    )

  }

/* EVENTS */

export const getEventsRealtime =
  (cb) => {

    return onSnapshot(

      collection(db, 'events'),

      (snapshot) => {

        cb(

          snapshot.docs.map(
            (doc) => ({

              id: doc.id,

              ...doc.data()

            })
          )

        )

      }

    )

  }

/* UPLOADS */

export const getUploadsRealtime =
  (cb) => {

    const q = query(

      collection(db, 'uploads'),

      orderBy(
        'createdAt',
        'desc'
      )

    )

    return onSnapshot(

      q,

      (snapshot) => {

        cb(

          snapshot.docs.map(
            (doc) => ({

              id: doc.id,

              ...doc.data()

            })
          )

        )

      }

    )

  }

/* SUBMIT AI UPLOAD */

export const submitUpload =
  async (upload) => {

    return await addDoc(

      collection(db, 'uploads'),

      {

        ...upload,

        status:
          'pending',

        createdAt:
          Date.now()

      }

    )

  }

/* APPROVE */

export const approveUpload =
  async (
    uploadId,
    userId,
    points
  ) => {

    try {

      /* APPROVE UPLOAD */

      await updateDoc(

        doc(
          db,
          'uploads',
          uploadId
        ),

        {

          status:
            'approved'

        }

      )

      /* ADD USER POINTS */

      await updateDoc(

        doc(
          db,
          'users',
          userId
        ),

        {

          points:
            increment(points),

          uploads:
            increment(1)

        }

      )

      console.log(
        'UPLOAD APPROVED'
      )

    } catch (error) {

      console.log(
        error
      )

    }

  }

/* REJECT */

export const rejectUpload =
  async (uploadId) => {

    try {

      await updateDoc(

        doc(
          db,
          'uploads',
          uploadId
        ),

        {

          status:
            'rejected'

        }

      )

    } catch (error) {

      console.log(error)

    }

  }

/* DELETE */

export const deleteUpload =
  async (uploadId) => {

    try {

      await deleteDoc(

        doc(
          db,
          'uploads',
          uploadId
        )

      )

    } catch (error) {

      console.log(error)

    }

  }

/* JOIN EVENT */

export const joinEvent =
  async (
    uid,
    eventId
  ) => {

    try {

      await updateDoc(

        doc(
          db,
          'users',
          uid
        ),

        {

          joinedEvents:
            arrayUnion(eventId)

        }

      )

    } catch (error) {

      console.log(error)

    }

  }

/* CREATE EVENT */

export const createEvent =
  async (event) => {

    return await addDoc(

      collection(db, 'events'),

      {

        ...event,

        createdAt:
          Date.now()

      }

    )

  }

/* RESET EVERYTHING */

export const resetAllData =
  async () => {

    try {

      /* DELETE UPLOADS */

      const uploadsSnap =
        await getDocs(

          collection(
            db,
            'uploads'
          )

        )

      for (const upload of uploadsSnap.docs) {

        await deleteDoc(
          upload.ref
        )

      }

      /* RESET USERS */

      const usersSnap =
        await getDocs(

          collection(
            db,
            'users'
          )

        )

      for (const user of usersSnap.docs) {

        await updateDoc(

          user.ref,

          {

            points: 0,

            uploads: 0,

            joinedEvents: [],

            badges: []

          }

        )

      }

      console.log(
        'ALL DATA RESET'
      )

    } catch (error) {

      console.log(error)

    }

  }