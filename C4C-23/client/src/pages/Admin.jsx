import {

  useEffect,
  useState

} from 'react'

import Navbar from '../components/Navbar'

import {

  getUploadsRealtime,
  getUsersRealtime,
  approveUpload,
  rejectUpload,
  deleteUpload,
  createEvent,
  resetAllData

} from '../firebase/firestore'

function Admin() {

  const [uploads, setUploads] =
    useState([])

  const [users, setUsers] =
    useState([])

  const [title, setTitle] =
    useState('')

  const [location, setLocation] =
    useState('')

  const [date, setDate] =
    useState('')

  useEffect(() => {

    const unsubUploads =
      getUploadsRealtime(
        setUploads
      )

    const unsubUsers =
      getUsersRealtime(
        setUsers
      )

    return () => {

      unsubUploads()

      unsubUsers()

    }

  }, [])

  /* APPROVE */

  const handleApprove =
    async (upload) => {

      await approveUpload(

        upload.id,

        upload.userId,

        upload.pointsAwarded

      )

      alert(
        'Upload approved'
      )

    }

  /* REJECT */

  const handleReject =
    async (uploadId) => {

      await rejectUpload(
        uploadId
      )

      alert(
        'Upload rejected'
      )

    }

  /* DELETE */

  const handleDelete =
    async (uploadId) => {

      await deleteUpload(
        uploadId
      )

      alert(
        'Upload deleted'
      )

    }

  /* CREATE EVENT */

  const handleCreateEvent =
    async () => {

      if (
        !title ||
        !location ||
        !date
      ) {

        alert(
          'Fill all fields'
        )

        return

      }

      await createEvent({

        title,

        location,

        date,

        attendees: []

      })

      alert(
        'Event created'
      )

      setTitle('')
      setLocation('')
      setDate('')

    }

  /* RESET */

  const handleReset =
    async () => {

      const confirmReset =
        window.confirm(

          'Reset all uploads and user points?'

        )

      if (!confirmReset)
        return

      await resetAllData()

      alert(
        'All data reset'
      )

    }

  return (

    <>
      <Navbar />

      <div className='section'>

        <div className='dashboard-header'>

          <div>

            <div className='section-tag'>
              Admin Panel
            </div>

            <h2>
              EcoRewards Control 🛠
            </h2>

            <p>

              Manage AI uploads,
              events and users.

            </p>

          </div>

          <button

            className='delete-btn'

            onClick={handleReset}

          >

            Reset All Data

          </button>

        </div>

        {/* CREATE EVENT */}

        <div className='admin-card'>

          <h3>
            Create Cleanup Event
          </h3>

          <input
            type='text'
            placeholder='Event title'
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />

          <input
            type='text'
            placeholder='Location'
            value={location}
            onChange={(e) =>
              setLocation(
                e.target.value
              )
            }
          />

          <input
            type='date'
            value={date}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
          />

          <button
            className='btn-primary'
            onClick={
              handleCreateEvent
            }
          >

            Create Event

          </button>

        </div>

        {/* PENDING */}

        <div className='admin-card'>

          <h3>
            Pending Uploads
          </h3>

          <div className='upload-grid'>

            {uploads
              .filter(
                (u) =>
                  u.status ===
                  'pending'
              )
              .map((upload) => (

                <div
                  key={upload.id}
                  className='upload-card'
                >

                  <img
                    src={
                      upload.imageUrl
                    }
                    alt='plastic'
                    className='upload-image'
                  />

                  <h4>
                    {
                      upload.userName
                    }
                  </h4>

                  <p>
                    📍
                    {' '}
                    {upload.city}
                  </p>

                  <p>

                    Confidence:
                    {' '}
                    {
                      upload.confidence
                    }
                    %

                  </p>

                  <p>

                    Reward:
                    {' '}
                    {
                      upload.pointsAwarded
                    }
                    pts

                  </p>

                  <div
                    className='admin-actions'
                  >

                    <button
                      className='btn-primary'
                      onClick={() =>
                        handleApprove(
                          upload
                        )
                      }
                    >

                      Approve

                    </button>

                    <button
                      className='reject-btn'
                      onClick={() =>
                        handleReject(
                          upload.id
                        )
                      }
                    >

                      Reject

                    </button>

                  </div>

                </div>

              ))}

          </div>

        </div>

        {/* REJECTED */}

        <div className='admin-card'>

          <h3>
            Rejected Uploads
          </h3>

          <div className='upload-grid'>

            {uploads
              .filter(
                (u) =>
                  u.status ===
                  'rejected'
              )
              .map((upload) => (

                <div
                  key={upload.id}
                  className='upload-card'
                >

                  <img
                    src={
                      upload.imageUrl
                    }
                    alt='rejected'
                    className='upload-image'
                  />

                  <h4>
                    {
                      upload.userName
                    }
                  </h4>

                  <button
                    className='delete-btn'
                    onClick={() =>
                      handleDelete(
                        upload.id
                      )
                    }
                  >

                    Delete

                  </button>

                </div>

              ))}

          </div>

        </div>

        {/* TOP USERS */}

        <div className='admin-card'>

          <h3>
            Top Users
          </h3>

          {users
            .slice(0, 5)
            .map((user, index) => (

              <div
                key={user.id}
                className='leader-row'
              >

                <span>

                  #{index + 1}
                  {' '}
                  {user.name}

                </span>

                <strong>

                  {user.points}
                  {' '}
                  pts

                </strong>

              </div>

            ))}

        </div>

      </div>

    </>

  )

}

export default Admin