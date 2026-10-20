import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initSsoToken } from '@/utils/auth'
import { applyBrandTheme } from '@/utils/brand'

initSsoToken();
applyBrandTheme('Admin');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
