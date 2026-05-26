import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar'

function Landing() {

  return (

    <>
      <Navbar />

      <div className='landing-page'>

        {/* HERO */}

        <section className='hero-section'>

          <div className='hero-content'>

            <div className='section-tag'>
              AI Powered Sustainability Platform
            </div>

            <h1>

              Gamifying
              {' '}

              <span className='green-text'>
                Plastic Recycling
              </span>

              {' '}
              For Smarter Cities ♻

            </h1>

            <p>

              Upload plastic waste images,
              earn eco points,
              join municipality cleanup drives,
              climb city leaderboards,
              and redeem sustainable rewards.

            </p>

            <div className='hero-buttons'>

              <Link to='/register'>

                <button className='btn-primary'>
                  Get Started
                </button>

              </Link>

              <Link to='/login'>

                <button className='btn-secondary'>
                  Login
                </button>

              </Link>

            </div>

          </div>

          {/* HERO CARD */}

          <div className='hero-card'>

            <div className='hero-card-top'>

              <div className='hero-avatar'>
                🌿
              </div>

              <div>

                <h3>
                  Eco Champion
                </h3>

                <p>
                  Bangalore Leaderboard
                </p>

              </div>

            </div>

            <div className='hero-stats'>

              <div className='hero-stat'>

                <h2>
                  12K+
                </h2>

                <p>
                  Plastic Uploads
                </p>

              </div>

              <div className='hero-stat'>

                <h2>
                  3.2T
                </h2>

                <p>
                  Waste Recycled
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* FEATURES */}

        <section className='features-section'>

          <div className='section-header'>

            <div className='section-tag'>
              Features
            </div>

            <h2>
              Everything Needed For
              Smart Sustainability
            </h2>

          </div>

          <div className='features-grid'>

            <div className='feature-card'>

              <div className='feature-icon'>
                🤖
              </div>

              <h3>
                AI Waste Detection
              </h3>

              <p>

                Upload images and let AI
                verify recyclable plastics
                instantly.

              </p>

            </div>

            <div className='feature-card'>

              <div className='feature-icon'>
                🌿
              </div>

              <h3>
                Reward System
              </h3>

              <p>

                Redeem eco points for
                saplings, fertilizers,
                and reusable products.

              </p>

            </div>

            <div className='feature-card'>

              <div className='feature-icon'>
                🏆
              </div>

              <h3>
                Leaderboards
              </h3>

              <p>

                Compete with users across
                Bangalore, Mysore,
                Mangalore and Moodbidri.

              </p>

            </div>

            <div className='feature-card'>

              <div className='feature-icon'>
                🧹
              </div>

              <h3>
                Cleanup Events
              </h3>

              <p>

                Join municipality drives
                and earn bonus points
                through QR attendance.

              </p>

            </div>

          </div>

        </section>

      </div>

    </>

  )

}

export default Landing