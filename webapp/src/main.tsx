import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/authContext.tsx'
import { PlantProvider } from '@/context/plantsContext.tsx'
import { SidebarProvider } from '@/components/sidebar/sidebarLayout.tsx'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { toast } from 'sonner'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  // Aggiungiamo un gestore di errori globale!
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error("Errore di connessione", {
        description: error.message || "Impossibile comunicare con il server."
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PlantProvider>
            <SidebarProvider>
              <App />
            </SidebarProvider>
          </PlantProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
