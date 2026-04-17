import { createRoot } from 'react-dom/client'
import { NuqsAdapter } from 'nuqs/adapters/react'
import './i18n'
import './index.css'
import App from './App.tsx'
import QueryProvider from './context/query-provider.tsx'
import { Toaster } from './components/ui/toaster.tsx'

createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <NuqsAdapter>
      <App />
    </NuqsAdapter>
    <Toaster />
  </QueryProvider>
)
