import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistrationForm } from './registration-form';
import { supabase } from '@/services/supabase_client';
import { toast } from 'sonner';

// --- MOCKS ---
vi.mock('@/services/supabase_client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock scrollIntoView for Radix UI
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('RegistrationForm', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    render(<RegistrationForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    // Use Strict Regex to distinguish Nome from Cognome
    expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^cognome$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/codice fiscale/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefono/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrati/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<RegistrationForm />);
    
    const submitButton = screen.getByRole('button', { name: /registrati/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText("Inserisci un'email valida")).toBeInTheDocument();
        expect(screen.getByText("Inserisci un nome valido")).toBeInTheDocument();
    });
  });

  it('automatically fetches City and Province when ZIP code is entered', async () => {
    render(<RegistrationForm />);

    const mockSelect = vi.fn().mockResolvedValue({
        data: [{ nome: 'Milano', provincia: 'MI' }],
        error: null
    });
    
    (supabase.from as any).mockImplementation(() => ({
        select: () => ({
            eq: mockSelect
        })
    }));

    const zipInput = screen.getByLabelText(/cap/i);
    fireEvent.change(zipInput, { target: { value: '20100' } });

    await waitFor(() => {
        expect(mockSelect).toHaveBeenCalled(); 
    });

    await waitFor(() => {
        expect(screen.getByText(/Milano \(MI\)/i)).toBeInTheDocument();
    });
  });

  it('submits data to Supabase when form is valid', async () => {
    render(<RegistrationForm />);

    // 1. FILL FORM WITH VALID DATA (Matching Zod Schema)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    
    // Password needs: Upper, Lower, Number, Special Char
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'StrongPass1!' } }); 
    
    fireEvent.change(screen.getByLabelText(/^nome$/i), { target: { value: 'Mario' } });
    fireEvent.change(screen.getByLabelText(/^cognome$/i), { target: { value: 'Rossi' } });
    
    // Valid Italian Fiscal Code format
    fireEvent.change(screen.getByLabelText(/codice fiscale/i), { target: { value: 'RSSMRA80A01H501U' } });
    
    // Valid Phone Number
    fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: '3331234567' } });
    
    fireEvent.change(screen.getByLabelText(/via/i), { target: { value: 'Roma' } });
    fireEvent.change(screen.getByLabelText(/n°/i), { target: { value: '10' } });

    // 2. MOCK ZIP CODE FETCH (Must succeed for City to be set)
    (supabase.from as any).mockImplementation(() => ({
        select: () => ({ eq: vi.fn().mockResolvedValue({ data: [{ nome: 'Roma', provincia: 'RM' }], error: null }) })
    }));
    
    const zipInput = screen.getByLabelText(/cap/i);
    fireEvent.change(zipInput, { target: { value: '00100' } });

    // Wait for City/Province to be populated (crucial for "city" field validation)
    await waitFor(() => {
         expect(screen.getByText(/Roma \(RM\)/i)).toBeInTheDocument();
    });

    // 3. MOCK SIGN UP RESPONSE
    (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: { id: '123' } },
        error: null
    });

    // 4. SUBMIT
    const submitButton = screen.getByRole('button', { name: /registrati/i });
    fireEvent.click(submitButton);

    // 5. ASSERTIONS
    await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'test@example.com',
                password: 'StrongPass1!',
                options: expect.objectContaining({
                    data: expect.objectContaining({
                        name: 'Mario',
                        surname: 'Rossi',
                        ssn: 'RSSMRA80A01H501U',
                        phone: '+393331234567', // Check prefix addition
                        city: 'Roma',
                        province: 'RM'
                    })
                })
            })
        );
        
        expect(toast.success).toHaveBeenCalledWith("Registrazione completata! Conferma la mail.");
    });
  });
});