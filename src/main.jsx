import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@appwrite.io/pink-icons";
import App from './App.jsx'
import AppWithTabs from './AppWithTabs.jsx'

// Check URL parameter to determine which app to show
const urlParams = new URLSearchParams(window.location.search);
const showRestaurant = urlParams.get('demo') === 'restaurant';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {showRestaurant ? <AppWithTabs /> : <App />}
  </StrictMode>,
)
