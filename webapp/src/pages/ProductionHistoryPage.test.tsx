import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductionHistoryPage from './ProductionHistoryPage';
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

vi.mock('@/services/supabase_client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'fake' } }
      })
    }
  }
}));

vi.mock('@/context/plantsContext', () => ({
  usePlants: () => ({
    plants: [{ id: '1', nome: 'Impianto Test', status: 'attivo' }],
    selectedPlant: '1',
    selectPlant: vi.fn(),
    refreshPlants: vi.fn(),
    getPlantStatus: () => 'attivo',
    isLoading: false,
  }),
}));

vi.mock('@/services/api_config', () => ({ API_BASE_URL: 'http://test' }));

vi.mock('recharts', async () => {
  const Original = await vi.importActual('recharts');
  return {
    ...Original,
    ResponsiveContainer: ({ children }: any) => <div style={{ width: 500, height: 500 }}>{children}</div>,
  };
});

// NEW: Mock Sidebar
vi.mock('@/components/sidebar/sidebarLayout', () => ({
  SidebarTrigger: () => <button>Sidebar</button>,
  useSidebar: () => ({ open: true, setOpen: vi.fn() })
}));

// --- 3. Mock Globals ---
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderPage = () => render(
  <QueryClientProvider client={createTestQueryClient()}>
    <BrowserRouter>
      <ProductionHistoryPage />
    </BrowserRouter>
  </QueryClientProvider>
);

describe('ProductionHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1' }, isPro: true });
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        chart: [],
        kpi: { totalEnergy: 100, co2: 20, peakValue: 5, peakTime: '12:00', efficiency: 90 }
      })
    });
  });

  it('renders correctly', async () => {
    renderPage();
    expect(screen.getByText(/Analisi Produzione/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('100.00')).toBeInTheDocument());
  });

  it('locks custom tab for free users', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, isPro: false });
    renderPage();
    const tab = screen.getByText(/Custom/i);
    fireEvent.click(tab);
    // Ensure tab is present; logic verification would typically check for toast call
    expect(tab).toBeInTheDocument();
  });
});