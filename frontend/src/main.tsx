import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// Apply stored theme immediately to avoid flash
const theme = localStorage.getItem('theme') || 'dark'
document.documentElement.classList.toggle('dark', theme === 'dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e2140', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          duration: 3000,
        }}
      />
    </BrowserRouter>
  </StrictMode>
)
