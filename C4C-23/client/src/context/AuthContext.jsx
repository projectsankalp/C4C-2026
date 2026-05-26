import {

  createContext,
  useContext,
  useEffect,
  useState

} from 'react'

import {

  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged

} from 'firebase/auth'

import {

  doc,
  setDoc,
  onSnapshot

} from 'firebase/firestore'

import {

  auth,
  db

} from '../firebase/firebase'

const AuthContext =
  createContext()

export const AuthProvider =
  ({ children }) => {

    const [

      currentUser,

      setCurrentUser

    ] = useState(null)

    const [

      loading,

      setLoading

    ] = useState(true)

    /* REGISTER */

    const register =
      async (

        name,
        email,
        password,
        city,
        role = 'user'

      ) => {

        const res =
          await createUserWithEmailAndPassword(

            auth,
            email,
            password

          )

        const userData = {

          uid:
            res.user.uid,

          name,

          email,

          city,

          role,

          points: 0,

          uploads: 0,

          joinedEvents: [],

          rewardsRedeemed: [],

          badges: [],

          createdAt:
            Date.now()

        }

        await setDoc(

          doc(
            db,
            'users',
            res.user.uid
          ),

          userData

        )

      }

    /* LOGIN */

    const login =
      (email, password) => {

        return signInWithEmailAndPassword(

          auth,
          email,
          password

        )

      }

    /* LOGOUT */

    const logout =
      () => signOut(auth)

    /* REALTIME USER */

    useEffect(() => {

      let unsubFirestore =
        null

      const unsubAuth =
        onAuthStateChanged(

          auth,

          async (user) => {

            if (user) {

              const userRef =
                doc(
                  db,
                  'users',
                  user.uid
                )

              unsubFirestore =
                onSnapshot(

                  userRef,

                  (snap) => {

                    if (
                      snap.exists()
                    ) {

                      setCurrentUser({

                        uid:
                          user.uid,

                        ...snap.data()

                      })

                    }

                    setLoading(
                      false
                    )

                  }

                )

            } else {

              setCurrentUser(
                null
              )

              setLoading(false)

            }

          }

        )

      return () => {

        unsubAuth()

        if (
          unsubFirestore
        ) {

          unsubFirestore()

        }

      }

    }, [])

    return (

      <AuthContext.Provider
        value={{

          currentUser,

          register,

          login,

          logout

        }}
      >

        {!loading &&
          children}

      </AuthContext.Provider>

    )

  }

export const useAuth =
  () => {

    return useContext(
      AuthContext
    )

  }

export default AuthContext