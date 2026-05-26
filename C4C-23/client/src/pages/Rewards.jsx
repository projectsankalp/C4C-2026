import { useState } from 'react'
import Navbar from '../components/Navbar'

function Rewards() {

  const [points, setPoints] = useState(2840)

  const [redeemed, setRedeemed] = useState([])

  const rewards = [

    {
      id: 1,
      title: 'Plant Sapling',
      points: 500,
      icon: '🌱',
      description:
        'Redeem a municipality sponsored sapling.'
    },

    {
      id: 2,
      title: 'Organic Fertilizer Kit',
      points: 800,
      icon: '🪴',
      description:
        'Eco-friendly fertilizer package.'
    },

    {
      id: 3,
      title: 'Reusable Water Bottle',
      points: 1200,
      icon: '♻',
      description:
        'Sustainable stainless steel bottle.'
    },

    {
      id: 4,
      title: 'Community Hero Badge',
      points: 1500,
      icon: '🏆',
      description:
        'Exclusive recognition badge.'
    }

  ]

  const handleRedeem = (reward) => {

    if (points < reward.points) {

      alert('Not enough points!')

      return

    }

    setPoints(points - reward.points)

    setRedeemed([
      ...redeemed,
      reward.id
    ])

  }

  return (
    <>
      <Navbar />

      <div className="section">

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <div className="section-tag">
              Eco Rewards Store
            </div>

            <h2>
              Redeem Sustainability Rewards 🎁
            </h2>

            <p>
              Use your eco points earned through
              recycling and cleanup participation
              to unlock municipality rewards.
            </p>

          </div>

          <div className="dashboard-rank">
            🌿 {points} Available Points
          </div>

        </div>

        {/* REWARD STATS */}

        <div className="dashboard-grid">

          <div className="dashboard-card">

            <div className="dashboard-icon">
              🎁
            </div>

            <div>
              <h3>{redeemed.length}</h3>
              <p>Rewards Redeemed</p>
            </div>

          </div>

          <div className="dashboard-card">

            <div className="dashboard-icon">
              🌿
            </div>

            <div>
              <h3>{points}</h3>
              <p>Remaining Points</p>
            </div>

          </div>

          <div className="dashboard-card">

            <div className="dashboard-icon">
              🏆
            </div>

            <div>
              <h3>Eco Hero</h3>
              <p>Current Rank</p>
            </div>

          </div>

        </div>

        {/* REWARD CARDS */}

        <div className="features-grid">

          {rewards.map((reward) => {

            const isRedeemed =
              redeemed.includes(reward.id)

            return (

              <div
                key={reward.id}
                className={
                  isRedeemed
                    ? 'reward-card redeemed-card'
                    : 'reward-card'
                }
              >

                <div className="reward-top">

                  <div className="reward-icon">
                    {reward.icon}
                  </div>

                  <div className="reward-points">
                    🌿 {reward.points}
                  </div>

                </div>

                <h3>
                  {reward.title}
                </h3>

                <p>
                  {reward.description}
                </p>

                <button
                  className={
                    isRedeemed
                      ? 'btn-disabled'
                      : 'btn-primary'
                  }

                  disabled={isRedeemed}

                  onClick={() =>
                    handleRedeem(reward)
                  }
                >

                  {isRedeemed
                    ? 'Redeemed'
                    : 'Redeem Reward'}

                </button>

              </div>

            )

          })}

        </div>

        {/* REDEEM HISTORY */}

        <div className="dashboard-section">

          <div className="dashboard-section-header">
            <h3>
              Redemption History
            </h3>
          </div>

          <div className="activity-list">

            {redeemed.length === 0 ? (

              <div className="activity-item">

                <div className="activity-left">

                  <div className="activity-icon">
                    🎁
                  </div>

                  <div>
                    <h4>
                      No Rewards Redeemed Yet
                    </h4>

                    <p>
                      Start redeeming eco rewards.
                    </p>
                  </div>

                </div>

              </div>

            ) : (

              rewards
                .filter((reward) =>
                  redeemed.includes(reward.id)
                )
                .map((reward) => (

                  <div
                    key={reward.id}
                    className="activity-item"
                  >

                    <div className="activity-left">

                      <div className="activity-icon">
                        {reward.icon}
                      </div>

                      <div>

                        <h4>
                          {reward.title}
                        </h4>

                        <p>
                          Reward redeemed successfully
                        </p>

                      </div>

                    </div>

                    <span>
                      -{reward.points} pts
                    </span>

                  </div>

                ))

            )}

          </div>

        </div>

      </div>
    </>
  )
}

export default Rewards