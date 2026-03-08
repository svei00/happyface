import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import HappyFaceApp from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HappyFaceApp />
  </StrictMode>
)
