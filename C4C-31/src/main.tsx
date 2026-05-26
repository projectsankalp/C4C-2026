import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AntigravityNav from './components/AntigravityNav.tsx'

const showAntigravity = window.location.search.includes('antigravity') || window.location.hash === '#antigravity';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {showAntigravity ? <AntigravityNav /> : <App />}
  </StrictMode>,
)
