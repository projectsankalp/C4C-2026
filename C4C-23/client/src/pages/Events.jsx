import {

  useEffect,
  useState

} from 'react'

import Navbar from '../components/Navbar'

import {

  getEventsRealtime,
  joinEvent

} from '../firebase/firestore'

import {

  useAuth

} from '../context/AuthContext'

function Events() {

  const [events, setEvents] =
    useState([])

  const { currentUser } =
    useAuth()

  useEffect(() => {

    const unsub =
      getEventsRealtime(
        setEvents
      )

    return () =>
      unsub()

  }, [])

  const handleJoin =
    async (eventId) => {

      try {

        await joinEvent(

          currentUser.uid,

          eventId

        )

        alert(
          'Joined event successfully'
        )

      } catch (error) {

        console.log(error)

      }

    }

  return (

    <>
      <Navbar />

      <div className='section'>

        <div className='dashboard-header'>

          <div>

            <div className='section-tag'>
              Community Drives
            </div>

            <h2>
              Sustainability Events 🌱
            </h2>

          </div>

        </div>

        <div className='event-grid'>

          {events.map(
            (event) => {

              const joined =
                currentUser
                  ?.joinedEvents
                  ?.includes(
                    event.id
                  )

              return (

                <div
                  key={event.id}
                  className='event-card'
                >

                  <h3>
                    {event.title}
                  </h3>

                  <p>
                    📍
                    {' '}
                    {event.location}
                  </p>

                  <p>
                    📅
                    {' '}
                    {event.date}
                  </p>

                  <button

                    className='btn-primary'

                    disabled={joined}

                    onClick={() =>
                      handleJoin(
                        event.id
                      )
                    }

                  >

                    {joined
                      ? 'Joined'
                      : 'Join Event'}

                  </button>

                </div>

              )

            }
          )}

        </div>

      </div>

    </>

  )

}

export default Events