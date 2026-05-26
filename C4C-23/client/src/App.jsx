import {
  Routes,
  Route
} from 'react-router-dom'

import Landing from './pages/Landing'

import Login from './pages/Login'

import Register from './pages/Register'

import Dashboard from './pages/Dashboard'

import Detect from './pages/Detect'

import Events from './pages/Events'

import Rewards from './pages/Rewards'

import Leaderboard from './pages/Leaderboard'

import Admin from './pages/Admin'

import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (

    <Routes>

      {/* PUBLIC */}

      <Route
        path='/'
        element={<Landing />}
      />

      <Route
        path='/login'
        element={<Login />}
      />

      <Route
        path='/register'
        element={<Register />}
      />

      {/* PROTECTED */}

      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path='/detect'
        element={
          <ProtectedRoute>
            <Detect />
          </ProtectedRoute>
        }
      />

      <Route
        path='/events'
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />

      <Route
        path='/leaderboard'
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      <Route
        path='/rewards'
        element={
          <ProtectedRoute>
            <Rewards />
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin'
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />

    </Routes>

  )

}

export default App