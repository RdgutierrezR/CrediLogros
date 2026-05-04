import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/theme.css'
import './components/dashboard.css'
import App from './App.jsx'

window.onerror = function(msg, url, line) {
  console.error("ERROR GLOBAL:", msg, "line:", line);
};

window.onunhandledrejection = function(e) {
  console.error("PROMISE REJECTED:", e.reason);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
