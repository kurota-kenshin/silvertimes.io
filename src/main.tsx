import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PrivyProvider } from './providers/PrivyProvider.tsx'
import { LoginModalProvider } from './components/LoginModalProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider>
      <LoginModalProvider>
        <App />
      </LoginModalProvider>
    </PrivyProvider>
  </React.StrictMode>,
)
