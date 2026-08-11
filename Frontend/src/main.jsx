import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { SurveyProvider } from './context/SurveyContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SurveyProvider>
      <App />
    </SurveyProvider>
  </StrictMode>,
)
