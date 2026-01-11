import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { GeoProvider } from './context/GeoContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <GeoProvider>
        <App />
      </GeoProvider>
    </HelmetProvider>
  </StrictMode>,
)
