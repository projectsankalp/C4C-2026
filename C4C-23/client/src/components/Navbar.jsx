import {
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom'

import { useState } from 'react'

import { useAuth } from '../context/AuthContext'

function Navbar() {

  const location = useLocation()

  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] =
    useState(false)

  const {
    currentUser,
    logout,
    loading
  } = useAuth()

  if (loading) {

    return null

  }

  const handleLogout = async () => {

    try {

      await logout()

      setMenuOpen(false)

      navigate('/')

    } catch (error) {

      console.log(error)

    }

  }

  return (

    <nav>

      <div className="nav-inner">

        {/* LOGO */}

        <Link
          to='/'
          className="logo"
        >

          <div className="logo-icon">
            ♻
          </div>

          EcoRewards

        </Link>

        {/* DESKTOP NAV */}

        <div className="nav-links desktop-nav">

          {currentUser ? (

            <>

              <Link
                to='/dashboard'
                className={
                  location.pathname === '/dashboard'
                    ? 'nav-link active-nav'
                    : 'nav-link'
                }
              >
                Dashboard
              </Link>

              <Link
                to='/detect'
                className={
                  location.pathname === '/detect'
                    ? 'nav-link active-nav'
                    : 'nav-link'
                }
              >
                Detect
              </Link>

              <Link
                to='/leaderboard'
                className={
                  location.pathname === '/leaderboard'
                    ? 'nav-link active-nav'
                    : 'nav-link'
                }
              >
                Leaderboard
              </Link>

              <Link
                to='/rewards'
                className={
                  location.pathname === '/rewards'
                    ? 'nav-link active-nav'
                    : 'nav-link'
                }
              >
                Rewards
              </Link>

              <Link
                to='/events'
                className={
                  location.pathname === '/events'
                    ? 'nav-link active-nav'
                    : 'nav-link'
                }
              >
                Events
              </Link>

              {currentUser?.role === 'admin' && (

                <Link
                  to='/admin'
                  className={
                    location.pathname === '/admin'
                      ? 'nav-link active-nav'
                      : 'nav-link'
                  }
                >
                  Admin
                </Link>

              )}

            </>

          ) : (

            <>

              <Link
                to='/login'
                className='nav-link'
              >
                Login
              </Link>

              <Link
                to='/register'
                className='nav-link'
              >
                Register
              </Link>

            </>

          )}

        </div>

        {/* RIGHT */}

        <div className="nav-right">

          {currentUser && (

            <>

              <div className="points-badge">

                🌿
                {' '}
                {currentUser?.points || 0}
                {' '}
                pts

              </div>

              <div className="avatar">

                {currentUser?.name
                  ?.charAt(0)
                  ?.toUpperCase() || 'U'}

              </div>

              <button
                className='logout-btn'
                onClick={handleLogout}
              >

                Logout

              </button>

            </>

          )}

          {/* HAMBURGER */}

          <div
            className="hamburger"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
          >

            ☰

          </div>

        </div>

      </div>

      {/* MOBILE MENU */}

      {menuOpen && (

        <div className="mobile-menu">

          {currentUser ? (

            <>

              <Link
                to='/dashboard'
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Dashboard
              </Link>

              <Link
                to='/detect'
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Detect
              </Link>

              <Link
                to='/leaderboard'
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Leaderboard
              </Link>

              <Link
                to='/rewards'
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Rewards
              </Link>

              <Link
                to='/events'
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Events
              </Link>

              {currentUser?.role === 'admin' && (

                <Link
                  to='/admin'
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  Admin
                </Link>

              )}

              <button
                className='mobile-logout'
                onClick={handleLogout}
              >

                Logout

              </button>

            </>

          ) : (

            <>

              <Link
                to='/login'
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Login
              </Link>

              <Link
                to='/register'
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Register
              </Link>

            </>

          )}

        </div>

      )}

    </nav>

  )

}

export default Navbar