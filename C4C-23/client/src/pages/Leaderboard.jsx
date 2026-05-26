import Navbar from '../components/Navbar'

import { useApp } from '../context/AppContext'

const Leaderboard = () => {

  const appData = useApp() || {}

  const users = appData.users || []

  const sortedUsers = [...users].sort(
    (a, b) => b.points - a.points
  )

  return (

    <>
      <Navbar />

      <div className='leaderboard-container'>

        <div className='leaderboard-header'>

          <h2>
            Eco Leaderboard 🏆
          </h2>

          <p>
            Real-time sustainability rankings
            across Bangalore, Mangalore,
            Mysore and Belagavi.
          </p>

        </div>

        <div className='leaderboard-list'>

          {sortedUsers.map((user, index) => (

            <div
              key={user.id || index}
              className='leaderboard-item'
            >

              <div className='leaderboard-left'>

                <div className='leaderboard-rank'>
                  #{index + 1}
                </div>

                <div className='leaderboard-avatar'>
                  {user.name?.charAt(0)}
                </div>

                <div>

                  <h4>{user.name}</h4>

                  <p>
                    📍 {user.city}
                  </p>

                </div>

              </div>

              <div className='leaderboard-right'>

                <div className='leaderboard-badge'>
                  📷 {user.uploads || 0} uploads
                </div>

                <div className='leaderboard-points'>
                  🌿 {user.points || 0} pts
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </>

  )

}

export default Leaderboard