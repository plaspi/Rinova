import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SupportPage from './SupportPage';
import { SidebarProvider } from '@/components/sidebar/sidebarLayout';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- MOCKS ---
// Mock matchMedia for Shadcn components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('@/context/authContext', () => ({
  useAuth: () => ({ user: { id: '123', email: 'test@rinova.it' }, isPro: true }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

// Mock Supabase to prevent "Invalid supabaseUrl" errors
vi.mock('@/services/supabase_client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'ticket-123' }, error: null }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'http://link' }, error: null })
      }))
    }
  }
}));

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
});

const renderPage = () => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <SidebarProvider>
        <SupportPage />
      </SidebarProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('SupportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly', () => {
    renderPage();
    expect(screen.getByText('Centro Assistenza')).toBeInTheDocument();
    expect(screen.getByLabelText(/Oggetto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Messaggio/i)).toBeInTheDocument();
  });

  it('validates empty inputs', async () => {
    renderPage();
    
    const submitBtn = screen.getByText('Invia Ticket');
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(screen.getByText("Seleziona una categoria")).toBeInTheDocument();
        expect(screen.getByText("Inserisci un oggetto")).toBeInTheDocument();
        expect(screen.getByText("Descrivi il problema con almeno 20 caratteri")).toBeInTheDocument();
    });
  });

  it('handles file upload interaction', () => {
    const { container } = renderPage();
    
    const file = new File(['dummy'], 'screenshot.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText('screenshot.png')).toBeInTheDocument();
  });
});