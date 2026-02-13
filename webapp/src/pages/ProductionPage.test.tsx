import { render, screen, waitFor } from '@testing-library/react';
import ProductionPage from './ProductionPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- 1. Hoist Auth Mock ---
const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn()
}));

// --- 2. Mock Contexts & Modules ---
vi.mock('@/context/authContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/context/plantsContext', () => ({
  usePlants: () => ({
    plants: [{ id: '1', nome: 'Impianto Alpha', status: 'attivo' }],
    refreshPlants: vi.fn(),
    getPlantStatus: () => 'attivo',
    isLoading: false,
  }),
}));

vi.mock('@/services/supabase_client', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'x' } } }) }
  }
}));

vi.mock('@/services/api_config', () => ({ API_BASE_URL: 'http://test' }));

// NEW: Mock Sidebar to prevent "useSidebar must be used within SidebarProvider"
vi.mock('@/components/sidebar/sidebarLayout', () => ({
  SidebarTrigger: () => <button data-testid="sidebar-trigger">Sidebar</button>,
  useSidebar: () => ({ open: true, setOpen: vi.fn(), isMobile: false })
}));

// --- 3. Mock Globals ---
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// --- 4. Setup Render ---
const renderPage = () => render(
  <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>
    <BrowserRouter>
      <ProductionPage />
    </BrowserRouter>
  </QueryClientProvider>
);

describe('ProductionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1' }, isPro: true });
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        kpi: { peak: 10, totalEnergy: 100, avgPower: 5 },
        charts: { '1': [] },
        plants: []
      })
    });
  });

  it('renders live data', async () => {
    renderPage();
    expect(screen.getByText(/Picco Massimo/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('10.00')).toBeInTheDocument());
  });

  it('shows lock for free users', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, isPro: false });
    renderPage();
    expect(screen.getByRole('button', { name: /Scarica Report/i })).toBeInTheDocument();
  });
});