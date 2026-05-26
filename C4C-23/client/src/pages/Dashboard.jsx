import Navbar from '../components/Navbar'

import { useAuth } from '../context/AuthContext'

import { useApp } from '../context/AppContext'

function Dashboard() {

  const { currentUser } =
    useAuth()

  const {
    uploads = [],
    events = []
  } = useApp()

  /* ONLY APPROVED UPLOADS */

  const approvedUploads =
    uploads.filter(
      (upload) =>
        upload.userId ===
          currentUser?.uid &&
        upload.status ===
          'approved'
    )

  /* JOINED EVENTS */

  const joinedEvents =
    events.filter(
      (event) =>
        currentUser?.joinedEvents?.includes(
          event.id
        )
    )

  /* TOTAL STATS */

  const totalPlastic =
    approvedUploads.length

  const wastePrevented =
    (
      approvedUploads.length * 0.5
    ).toFixed(1)

  const totalUploads =
    approvedUploads.length

  return (

    <>
      <Navbar />

      <div className='section'>

        {/* HEADER */}

        <div className='dashboard-header'>

          <div>

            <div className='section-tag'>
              User Dashboard
            </div>

            <h2>

              Welcome Back,
              {' '}
              {currentUser?.name}
              {' '}
              👋

            </h2>

            <p>

              Track your eco impact,
              approved uploads,
              rewards and event activity.

            </p>

          </div>

          <div className='dashboard-rank'>

            {currentUser?.points >= 5000
              ? '🌎 Sustainability Legend'
              : currentUser?.points >= 2500
              ? '🏆 Eco Champion'
              : currentUser?.points >= 1000
              ? '🌱 Green Guardian'
              : '♻ Eco Warrior'}

          </div>

        </div>

        {/* STATS */}

        <div className='dashboard-grid'>

          <div className='dashboard-card'>

            <div className='dashboard-icon'>
              🌿
            </div>

            <div>

              <h3>
                {currentUser?.points || 0}
              </h3>

              <p>
                Total Points
              </p>

            </div>

          </div>

          <div className='dashboard-card'>

            <div className='dashboard-icon'>
              ♻
            </div>

            <div>

              <h3>
                {totalPlastic}
              </h3>

              <p>
                Approved Plastic Uploads
              </p>

            </div>

          </div>

          <div className='dashboard-card'>

            <div className='dashboard-icon'>
              📍
            </div>

            <div>

              <h3>
                {currentUser?.city}
              </h3>

              <p>
                City
              </p>

            </div>

          </div>

          <div className='dashboard-card'>

            <div className='dashboard-icon'>
              🌎
            </div>

            <div>

              <h3>
                {wastePrevented}
                KG
              </h3>

              <p>
                Waste Prevented
              </p>

            </div>

          </div>

        </div>

        {/* RECENT APPROVED ACTIVITY */}

        <div className='dashboard-section'>

          <div className='dashboard-section-header'>

            <h3>
              Approved Uploads
            </h3>

          </div>

          <div className='upload-grid'>

            {approvedUploads.length > 0 ? (

              approvedUploads.map(
                (upload) => (

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
                      Plastic Detected ♻
                    </h4>

                    <p>

                      Confidence:
                      {' '}
                      {
                        upload.confidence
                      }
                      %

                    </p>

                    <p>

                      Earned:
                      {' '}
                      {
                        upload.pointsAwarded
                      }
                      pts

                    </p>

                  </div>

                )
              )

            ) : (

              <p>
                No approved uploads yet.
              </p>

            )}

          </div>

        </div>

        {/* ACHIEVEMENTS */}

        <div className='dashboard-section'>

          <div className='dashboard-section-header'>

            <h3>
              Eco Achievement Badges
            </h3>

          </div>

          <div className='badge-grid'>

            <div
              className={
                currentUser?.points >= 500
                  ? 'badge-card unlocked'
                  : 'badge-card locked'
              }
            >

              <div className='badge-icon'>
                🥇
              </div>

              <h4>
                Eco Warrior
              </h4>

              <p>
                Earn 500 eco points
              </p>

            </div>

            <div
              className={
                currentUser?.points >= 1500
                  ? 'badge-card unlocked'
                  : 'badge-card locked'
              }
            >

              <div className='badge-icon'>
                🌱
              </div>

              <h4>
                Green Guardian
              </h4>

              <p>
                Earn 1500 eco points
              </p>

            </div>

            <div
              className={
                currentUser?.points >= 2500
                  ? 'badge-card unlocked'
                  : 'badge-card locked'
              }
            >

              <div className='badge-icon'>
                ♻
              </div>

              <h4>
                Recycling Master
              </h4>

              <p>
                Earn 2500 eco points
              </p>

            </div>

            <div
              className={
                currentUser?.points >= 5000
                  ? 'badge-card unlocked'
                  : 'badge-card locked'
              }
            >

              <div className='badge-icon'>
                🌎
              </div>

              <h4>
                Sustainability Legend
              </h4>

              <p>
                Reach 5000 eco points
              </p>

            </div>

          </div>

        </div>

        {/* JOINED EVENTS */}

        <div className='dashboard-section'>

          <div className='dashboard-section-header'>

            <h3>
              Joined Cleanup Events
            </h3>

          </div>

          <div className='events-grid'>

            {joinedEvents.length > 0 ? (

              joinedEvents.map(
                (event) => (

                  <div
                    key={event.id}
                    className='event-card'
                  >

                    <div className='event-date'>

                      {event.date}

                    </div>

                    <h4>
                      {event.title}
                    </h4>

                    <p>
                      📍
                      {' '}
                      {event.location}
                    </p>

                    <p>
                      ✅ Registered
                    </p>

                  </div>

                )
              )

            ) : (

              <p>
                No events joined yet.
              </p>

            )}

          </div>

        </div>

      </div>

    </>

  )

}

export default Dashboard