import { useState } from 'react'

import Navbar from '../components/Navbar'

import {
  signInWithEmailAndPassword
} from 'firebase/auth'

import {
  auth
} from '../firebase/firebase'

import {
  useNavigate
} from 'react-router-dom'

function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {

    e.preventDefault()

    if (loading) return

    setLoading(true)

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

        setTimeout(() => {

      navigate('/dashboard')

    }, 300)

    } catch (error) {

      console.log(error)

      alert(error.message)

    } finally {

      setLoading(false)

    }

  }

  return (
    <>
      <Navbar />

      <div className="auth-wrapper">

        <div className="auth-container">

          <h1>
            Welcome Back
          </h1>

          <p className="auth-sub">
            Login to continue your eco journey.
          </p>

          <form>

            <input
              type='email'
              placeholder='Enter email'
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <input
              type='password'
              placeholder='Enter password'
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              type='button'
              className='btn-primary auth-btn'
              onClick={handleLogin}
              disabled={loading}
            >

              {loading
                ? 'Logging In...'
                : 'Login'}

            </button>

          </form>

        </div>

      </div>
    </>
  )
}

export default Login