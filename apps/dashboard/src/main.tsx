import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@micro/ui/src/styles/globals.css'
import { App } from './App'
import { seedIfNeeded } from '@micro/storage'

// Seed sample data on first run
seedIfNeeded().catch(console.error)

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
