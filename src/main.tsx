import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from './services/queryClient'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        theme="dark"
        position="bottom-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          classNames: {
            toast: 'bg-card border border-border/60 text-foreground rounded-xl shadow-xl',
            title: 'text-foreground font-semibold text-sm',
            description: 'text-muted-foreground text-xs',
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
)

