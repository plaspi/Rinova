import { renderHook, waitFor, act } from '@testing-library/react';
import { PlantProvider, usePlants } from './plantsContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// 1. Use vi.hoisted for variables needed inside vi.mock
const { mockEq, mockSelect, mockFrom, mockUseAuth } = vi.hoisted(() => {
  const mockEq = vi.fn();
  // Create the chain: from -> select -> eq
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  const mockUseAuth = vi.fn();
  
  return { mockEq, mockSelect, mockFrom, mockUseAuth };
});

// 2. Mock Supabase using the hoisted variables
vi.mock('@/services/supabase_client', () => ({
  supabase: {
    from: mockFrom,
  },
}));

// 3. Mock Auth using the hoisted variable
vi.mock('@/context/authContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PlantProvider>{children}</PlantProvider>
);

describe('PlantContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Restore the chain (in case mockReset broke the links)
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });

    // Default: User is logged in
    mockUseAuth.mockReturnValue({ user: { id: 'user-123' } });
  });

  it('initializes with default values', async () => {
    mockEq.mockResolvedValue({ data: [], error: null });
    const { result } = renderHook(() => usePlants(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.plants).toEqual([]);
  });

  it('fetches plants and auto-selects if only one exists', async () => {
    const mockPlants = [{ id: 'p1', nome: 'Impianto Uno', status: 'attivo' }];
    mockEq.mockResolvedValue({ data: mockPlants, error: null });

    const { result } = renderHook(() => usePlants(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.plants).toHaveLength(1);
    expect(result.current.selectedPlant).toBe('p1');
  });

  it('auto-selects the first plant if multiple exist', async () => {
    const mockPlants = [
      { id: 'p1', nome: 'A', status: 'attivo' }, 
      { id: 'p2', nome: 'B', status: 'offline' }
    ];
    mockEq.mockResolvedValue({ data: mockPlants, error: null });

    const { result } = renderHook(() => usePlants(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.selectedPlant).toBe('p1');
  });

  it('allows manual selection of a plant', async () => {
    const mockPlants = [
        { id: 'p1', nome: 'A', status: 'attivo' }, 
        { id: 'p2', nome: 'B', status: 'offline' }
    ];
    mockEq.mockResolvedValue({ data: mockPlants, error: null });

    const { result } = renderHook(() => usePlants(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.selectPlant('p2'));
    expect(result.current.selectedPlant).toBe('p2');
  });

  it('getPlantStatus returns correct status', async () => {
    const mockPlants = [{ id: 'p1', nome: 'Impianto A', status: 'manutenzione' }];
    mockEq.mockResolvedValue({ data: mockPlants, error: null });

    const { result } = renderHook(() => usePlants(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.getPlantStatus('p1')).toBe('manutenzione');
  });

  it('clears plants if user logs out', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
    mockEq.mockResolvedValue({ data: [{ id: 'p1' }], error: null });

    const { result, rerender } = renderHook(() => usePlants(), { wrapper });
    await waitFor(() => expect(result.current.plants).toHaveLength(1));

    // Simulate Logout
    mockUseAuth.mockReturnValue({ user: null });
    rerender();

    await waitFor(() => expect(result.current.plants).toEqual([]));
  });
});