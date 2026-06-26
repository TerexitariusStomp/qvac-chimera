import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import App from './App.jsx'
import './index.css'

const PRIVY_APP_ID = 'cmqu05m41000h0djl70k738mx'

const isNative = typeof window !== 'undefined' && (window.Capacitor || window.__TAURI__ || window.__bridgeFetch)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        embeddedWallets: {
          createWalletOnLogin: true,
          requireUserPasswordOnCreate: false,
        },
        ...(isNative ? {
          supportedChains: [],
          defaultChain: undefined,
        } : {}),
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>,
)
