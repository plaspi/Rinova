import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlansPage from './PlansPage';
import { SidebarProvider } from '@/components/sidebar/sidebarLayout';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '@/context/authContext';

// --- MOCKS ---
vi.mock('@/context/authContext', () => ({
  useAuth: vi.fn(),
}));

// Mock ModeToggle
vi.mock('@/components/modeToggle', () => ({
  ModeToggle: () => <div data-testid="mode-toggle" />,
}));

vi.mock('sonner', () => ({
  toast: { info: vi.fn() },
}));

const renderPage = () => render(
  <BrowserRouter>
    <SidebarProvider>
      <PlansPage />
    </SidebarProvider>
  </BrowserRouter>
);

describe('PlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pricing cards correctly', () => {
    (useAuth as any).mockReturnValue({ isPro: false });
    
    renderPage();

    // FIX: Use getAllByText because it appears in Breadcrumb AND Header
    expect(screen.getAllByText('Piani e Tariffe').length).toBeGreaterThan(0);
    
    expect(screen.getByText('Gratis')).toBeInTheDocument(); // Base plan
    expect(screen.getByText('4,99€')).toBeInTheDocument();  // Pro plan
  });

  it('shows "Current Plan" on the correct card', () => {
    // Case 1: User is FREE
    (useAuth as any).mockReturnValue({ isPro: false });
    const { unmount } = renderPage();
    expect(screen.getByText('Piano Attuale')).toBeInTheDocument(); 
    unmount();

    // Case 2: User is PRO
    (useAuth as any).mockReturnValue({ isPro: true });
    renderPage();
    expect(screen.getByText('Attivo')).toBeInTheDocument();
  });
});