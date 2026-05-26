import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

import {
  getUsersRealtime,
  getEventsRealtime,
  getUploadsRealtime
} from '../firebase/firestore'

const AppContext = createContext()

export const AppProvider = ({ children }) => {

  const [users, setUsers] = useState([])

  const [events, setEvents] = useState([])

  const [uploads, setUploads] = useState([])

  useEffect(() => {

    const unsubUsers =
      getUsersRealtime(setUsers)

    const unsubEvents =
      getEventsRealtime(setEvents)

    const unsubUploads =
      getUploadsRealtime(setUploads)

    return () => {

      unsubUsers()

      unsubEvents()

      unsubUploads()

    }

  }, [])

  return (

    <AppContext.Provider
      value={{
        users,
        events,
        uploads
      }}
    >

      {children}

    </AppContext.Provider>

  )

}

export const useApp = () => {
  return useContext(AppContext)
}