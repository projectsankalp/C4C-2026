import { useState } from 'react'

import {
  Link,
  useNavigate
} from 'react-router-dom'

import Navbar from '../components/Navbar'

import { useAuth }
from '../context/AuthContext'

function Register() {

  const navigate = useNavigate()

  const { register } = useAuth()

  const [form, setForm] =
    useState({

      name: '',

      email: '',

      password: '',

      city: 'Bangalore',

      role: 'user',

      adminCode: ''

    })

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      if (
        form.role === 'admin' &&
        form.adminCode !== 'ECOADMIN2026'
      ) {

        alert('Invalid admin code')

        return

      }

      await register(

        form.name,

        form.email,

        form.password,

        form.city,

        form.role

      )

      if (form.role === 'admin') {

        navigate('/admin')

      } else {

        navigate('/dashboard')

      }

    } catch (error) {

      console.log(error)

      alert(error.message)

    }

  }

  return (

    <>
      <Navbar />

      <div className='auth-page'>

        <form
          className='auth-card'
          onSubmit={handleSubmit}
        >

          <h2>
            Create Account
          </h2>

          <input
            type='text'
            placeholder='Full Name'
            required
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
          />

          <input
            type='email'
            placeholder='Email'
            required
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
          />

          <input
            type='password'
            placeholder='Password'
            required
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
          />

          <select
            onChange={(e) =>
              setForm({
                ...form,
                city: e.target.value
              })
            }
          >

            <option>
              Bangalore
            </option>

            <option>
              Mangalore
            </option>

            <option>
              Mysore
            </option>

            <option>
              Moodbidri
            </option>

          </select>

          <select
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value
              })
            }
          >

            <option value='user'>
              User
            </option>

            <option value='admin'>
              Admin
            </option>

          </select>

          {form.role === 'admin' && (

            <input
              type='password'
              placeholder='Admin Secret Code'
              required
              onChange={(e) =>
                setForm({
                  ...form,
                  adminCode: e.target.value
                })
              }
            />

          )}

          <button
            type='submit'
            className='btn-primary'
          >

            Register

          </button>

          <p>

            Already have an account?

            <Link to='/login'>
              Login
            </Link>

          </p>

        </form>

      </div>

    </>

  )

}

export default Register